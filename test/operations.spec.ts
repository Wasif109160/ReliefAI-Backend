import "reflect-metadata";
import { describe, it, expect, jest } from "@jest/globals";
import { DataSource, Table } from "typeorm";
import { SosService } from "../src/modules/sos/sos.service";
import { SupplyService } from "../src/modules/supply/supply.service";
import { SosRequest } from "../src/modules/sos/entities/sos.entity";
import { CompletePlatformSchema1793200000000 } from "../src/database/migrations/1793200000000-complete-platform-schema";
import { dataSourceOptions } from "../src/config/database.config";
import { SeederService } from "../src/database/seeder.service";

describe("operational regressions", () => {
  it("rejects unknown responder teams without saving an SOS", async () => {
    const sosRepo = {
      findOne: jest.fn(async (_options: any) => ({ id: "sos-1", status: "pending" })),
      save: jest.fn(),
    };
    const teamRepo = { findOne: jest.fn(async (_options: any) => null), save: jest.fn() };
    const manager = {
      getRepository: (entity: any) =>
        entity === SosRequest ? sosRepo : teamRepo,
    };
    const service = new SosService(
      { manager: { transaction: async (fn: any) => fn(manager) } } as any,
      {} as any,
    );
    await expect(
      service.dispatchSos("sos-1", { teamId: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
    expect(sosRepo.save).not.toHaveBeenCalled();
    expect(teamRepo.save).not.toHaveBeenCalled();
    expect(sosRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ lock: { mode: "pessimistic_write" } }),
    );
  });
  it("rejects already assigned teams", async () => {
    const sosRepo = {
      findOne: async () => ({ id: "sos-1", status: "pending" }),
      save: jest.fn(),
    };
    const teamRepo = {
      findOne: async () => ({ status: "dispatched" }),
      save: jest.fn(),
    };
    const manager = {
      getRepository: (entity: any) =>
        entity === SosRequest ? sosRepo : teamRepo,
    };
    const service = new SosService(
      { manager: { transaction: async (fn: any) => fn(manager) } } as any,
      {} as any,
    );
    await expect(
      service.dispatchSos("sos-1", { teamId: "busy" }),
    ).rejects.toMatchObject({ status: 409 });
    expect(sosRepo.save).not.toHaveBeenCalled();
  });
  it("locks inventory and refuses insufficient stock without a write", async () => {
    const repo = {
      findOne: jest.fn(async (_options: any) => ({ quantity: 3, allocated: 0 })),
      save: jest.fn(),
    };
    const service = new SupplyService({
      manager: {
        transaction: async (fn: any) => fn({ getRepository: () => repo }),
      },
    } as any);
    await expect(
      service.processAction({ action: "dispatch", id: "item", quantity: 7 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: "item" },
      lock: { mode: "pessimistic_write" },
    });
    expect(repo.save).not.toHaveBeenCalled();
    for (const quantity of [0, -1, Infinity, NaN, 1.5]) {
      await expect(
        service.processAction({ action: "dispatch", id: "item", quantity }),
      ).rejects.toMatchObject({ status: 400 });
    }
  });
  it("does not seed on production startup even if demo flag is enabled", async () => {
    const previous = {
      node: process.env.NODE_ENV,
      seed: process.env.SEED_DEMO_DATA,
    };
    process.env.NODE_ENV = "production";
    process.env.SEED_DEMO_DATA = "true";
    const service = new SeederService(
      ...(Array(8).fill({}) as [any, any, any, any, any, any, any, any]),
    );
    const seed = jest.spyOn(service as any, "seedUsers");
    try {
      await service.onApplicationBootstrap();
      expect(seed).not.toHaveBeenCalled();
    } finally {
      if (previous.node === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous.node;
      if (previous.seed === undefined) delete process.env.SEED_DEMO_DATA;
      else process.env.SEED_DEMO_DATA = previous.seed;
    }
  });
  it("migration snapshot covers every entity column with matching database types", async () => {
    const ds = new DataSource({ ...dataSourceOptions, synchronize: false });
    await (ds as any).buildMetadatas();
    const tables: Table[] = [];
    await new CompletePlatformSchema1793200000000().up({
      hasTable: async () => false,
      createTable: async (table: Table) => {
        tables.push(table);
      },
      createIndex: async () => {},
    } as any);
    expect(tables.length).toBe(ds.entityMetadatas.length);
    for (const metadata of ds.entityMetadatas) {
      const expected = Table.create(metadata, ds.driver);
      const actual = tables.find((t) => t.name === expected.name)!;
      expect(actual).toBeDefined();
      for (const column of expected.columns) {
        const migrated = actual.columns.find((c) => c.name === column.name)!;
        expect(migrated).toBeDefined();
        expect(ds.driver.normalizeType(migrated as any)).toBe(column.type);
        expect(migrated.isNullable).toBe(column.isNullable);
        expect(migrated.isPrimary).toBe(column.isPrimary);
      }
    }
  });
});
