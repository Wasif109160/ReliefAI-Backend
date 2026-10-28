// Run only against a dedicated disposable PostgreSQL database:
// TEST_DATABASE_URL=postgresql://... npm run test:postgres
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../src/config/database.config';
import { SupplyItem } from '../src/modules/supply/entities/supply.entity';
import { SupplyService } from '../src/modules/supply/supply.service';
import { SosRequest } from '../src/modules/sos/entities/sos.entity';
import { ResponderTeam } from '../src/modules/responder/entities/responder.entity';
import { SosService } from '../src/modules/sos/sos.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';
import { User } from '../src/modules/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../src/common/enums/role.enum';

async function run() {
  if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL must name a disposable database');
  const ds = new DataSource({ type: 'postgres', url: process.env.TEST_DATABASE_URL,
    entities: dataSourceOptions.entities, migrations: dataSourceOptions.migrations,
    namingStrategy: dataSourceOptions.namingStrategy, synchronize: false, ssl: false, connectTimeoutMS: 10000 });
  await ds.initialize();
  try {
    assert.equal((await ds.runMigrations()).length, 2, 'Expected a fresh database with both migrations');
    for (const meta of ds.entityMetadatas) await ds.getRepository(meta.target).find({ take: 1 });
    console.log('PASS: full migration chain and all entity columns on fresh PostgreSQL');

    const supplies = ds.getRepository(SupplyItem);
    const item = await supplies.save(supplies.create({ name: 'Test water', category: 'water', quantity: 10, allocated: 0,
      threshold: 5, unit: 'boxes', warehouseLocation: 'Test warehouse' }));
    const stock = new SupplyService(supplies);
    const outcomes = await Promise.allSettled([1,2].map(() => stock.processAction({ action: 'dispatch', id: item.id, quantity: 7 })));
    assert.equal(outcomes.filter(r => r.status === 'fulfilled').length, 1);
    const remaining = await supplies.findOneByOrFail({ id: item.id });
    assert.equal(remaining.quantity, 3); assert.equal(remaining.allocated, 7);
    console.log('PASS: concurrent dispatch cannot oversell inventory');

    const sosRepo = ds.getRepository(SosRequest); const teams = ds.getRepository(ResponderTeam);
    const service = new SosService(sosRepo, teams);
    const first = (await service.createSos({ reporterName: 'Synthetic person', phone: 'test-only', location: { lat: 0, lng: 0 }, details: 'Test incident' })).sos;
    await assert.rejects(service.dispatchSos(first.id, { teamId: 'missing' }));
    assert.equal((await sosRepo.findOneByOrFail({ id: first.id })).status, 'pending');
    const second = (await service.createSos({ reporterName: 'Synthetic person 2', phone: 'test-only', location: { lat: 0, lng: 0 }, details: 'Test incident' })).sos;
    const team = await teams.save(teams.create({ name: 'Test team', leadName: 'Test lead', status: 'available', currentLocation: { lat: 0, lng: 0 } }));
    const dispatches = await Promise.allSettled([first,second].map(s => service.dispatchSos(s.id, { teamId: team.id })));
    assert.equal(dispatches.filter(r => r.status === 'fulfilled').length, 1);
    const assignedTeam = await teams.findOneByOrFail({ id: team.id });
    const assignedSos = await sosRepo.findOneByOrFail({ id: assignedTeam.assignedSOSId });
    assert.equal(assignedSos.assignedTeamId, team.id); assert.equal(assignedSos.status, 'dispatched');
    console.log('PASS: missing-team rejection and concurrent team assignment');

    const rollbackSos = (await service.createSos({ reporterName: 'Rollback test', phone: 'test-only', location: { lat: 0, lng: 0 }, details: 'Rollback test' })).sos;
    const rollbackTeam = await teams.save(teams.create({ name: 'Rollback team', leadName: 'Test lead', status: 'available', currentLocation: { lat: 0, lng: 0 } }));
    await ds.query(`CREATE FUNCTION reject_sos_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic write failure'; END; $$`);
    await ds.query(`CREATE TRIGGER reject_sos_update BEFORE UPDATE ON sos_requests FOR EACH ROW EXECUTE FUNCTION reject_sos_update()`);
    try {
      await assert.rejects(service.dispatchSos(rollbackSos.id, { teamId: rollbackTeam.id }));
      assert.equal((await teams.findOneByOrFail({ id: rollbackTeam.id })).status, 'available');
      assert.equal((await sosRepo.findOneByOrFail({ id: rollbackSos.id })).status, 'pending');
    } finally {
      await ds.query('DROP TRIGGER reject_sos_update ON sos_requests');
      await ds.query('DROP FUNCTION reject_sos_update()');
    }
    console.log('PASS: an SOS save failure rolls back the team assignment');

    const auth = new AuthService(ds.getRepository(User), new JwtService());
    const registered = await auth.register({ name: 'Test citizen', email: 'test@example.invalid', password: 'SyntheticPassword123!', role: Role.CITIZEN });
    const verifier = new JwtStrategy(ds.getRepository(User));
    const payload: any = new JwtService().decode(registered.accessToken);
    await verifier.validate(payload);
    const rotated = await auth.refreshToken(registered.refreshToken);
    await assert.rejects(auth.refreshToken(registered.refreshToken));
    await assert.rejects(auth.refreshToken(rotated.refreshToken));
    await assert.rejects(verifier.validate(payload));
    const login = await auth.login({ email: 'test@example.invalid', password: 'SyntheticPassword123!' });
    await auth.changePassword(login.user.id, { currentPassword: 'SyntheticPassword123!', newPassword: 'ChangedSynthetic123!' });
    await assert.rejects(auth.refreshToken(login.refreshToken));
    console.log('PASS: persisted sessions, refresh rotation/reuse and password revocation');
  } finally { await ds.destroy(); }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
