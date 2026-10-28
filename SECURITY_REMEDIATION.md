# Security and integration repair

This branch addresses the ten findings from the paired repository review. Pair it with the frontend `fix/security-and-integration` branch.

## Deployment sequence

1. Back up the existing PostgreSQL database. Use PostgreSQL 14 or newer. Inspect the full migration against a copy of the deployed schema before production use.
2. Configure distinct random `JWT_ACCESS_SECRET` (or legacy `JWT_BEARER_SECRET`) and `JWT_REFRESH_SECRET`, each at least 32 characters. Configure the same access/refresh secrets in Next.js. Never use public-prefixed variables for secrets.
3. Keep `DB_SYNCHRONIZE=false`. Run `npm run migration:run` before starting the backend. The new migration adds missing user fields and creates operational/session tables. It does not attempt to reinterpret incompatible pre-existing operational columns. Its down migration deliberately refuses destructive deletion; restore a backup for rollback.
4. Set `SEED_DEMO_DATA=false`. Production ignores this flag even if true. Existing demo accounts are not automatically removed: disable/delete them deliberately, rotate any exposed credentials, and revoke old sessions. Legacy tokens lack a session and are rejected after this update.
5. On an empty installation only, supply `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (12+ unique characters), and optional `BOOTSTRAP_ADMIN_NAME`. Run `npm run bootstrap:admin`. Remove these values afterward. This refuses to reset or overwrite an existing administrator.
6. Point Next.js `INTERNAL_API_URL` at this backend and deploy the matching frontend branch. Browser calls go through the frontend `/api` proxy, keeping cookies on the frontend host. No public backend URL is required for browser authentication.
7. Run acceptance checks on staging: login/reload/expiry/logout/password change; citizen denial on users/SOS; authorized operational access; missing/busy team dispatch; concurrent inventory dispatch; fresh database migration.

## Changed behavior

- User CRUD requires administrator authorization. Public registration rejects privileged roles and creates unverified citizens. Registration does not assert email ownership. Email verification/reset endpoints in the old frontend are not a backend verification workflow and require separate migration before use with backend users.
- All access tokens have issuer/audience, a session ID, and a short expiry. Guards validate current user status and the persisted session. Refresh tokens rotate; replay revokes the session. Logout and password changes revoke credentials. Users must sign in again after a password change.
- Full SOS records require operational roles. Public SOS creation remains available for emergency reporting; citizens do not receive unrestricted list access.
- Stock changes and team dispatch use transactional row locks. Existing assignments cannot be silently replaced by this dispatch endpoint.
- Demo seeding is opt-in outside production and creates only missing accounts. It never rewrites existing passwords.
- CORS rejects unlisted browser origins. Set `FRONTEND_URL` or `CORS_ORIGINS` for intentional direct API clients.

## Verification

`npm test -- --runInBand` exercises real Nest HTTP routing, JWT strategy, guards, registration, refresh rotation, logout/password revocation with isolated in-memory repository doubles. Operational tests check failure paths and required locks; the schema test compares the frozen migration to TypeORM metadata. These are not a substitute for PostgreSQL concurrency and staging browser checks. Use `npm run build` to verify compilation.

`TEST_DATABASE_URL=postgresql://... npm run test:postgres` must target a fresh disposable database. It executes both migrations, reads every entity, tests simultaneous stock/team dispatches, forced-failure rollback, persisted refresh reuse detection, and password/session revocation. The GitHub workflow runs it against PostgreSQL 16. Local verification used a disposable PostgreSQL 18 instance.

The dependency audit also reports pre-existing issues outside the ten code findings, including transitive multer/faker and nodemailer advisories. Some suggested fixes change major versions or downgrade packages; they were not force-applied. Review the audit separately before claiming a clean dependency/security audit.

## Scope

This branch does not migrate legacy frontend users into NestJS, send verification email, deploy a production service, or rotate secrets on a hosting provider. Existing users/data and live configuration require an explicit deployment/migration decision. Do not run both Prisma and TypeORM schema migrations against the same production schema without a reviewed data migration.
