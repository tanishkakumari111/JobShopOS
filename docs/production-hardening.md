# JobShop OS Production Hardening

## Phase 11A Status

JobShop OS now has a minimal Prisma and PostgreSQL foundation. The app UI still reads from the existing demo fixtures in `lib/demo-data` and the browser-local demo workflow overlay in `lib/demo-state`.

This phase adds:

- `prisma/schema.prisma` for the first-cut relational model
- `prisma/seed.ts` for deterministic seeding from the existing demo fixtures
- `.env.example` with the required `DATABASE_URL`
- npm scripts for generation, migration, seeding, and Prisma Studio

## Why Prisma and PostgreSQL

The founder-demo version proved the domain model. Prisma and PostgreSQL provide the production-ready persistence layer needed for:

- transactional workflow updates
- append-only audit logging
- role-based authorization
- deterministic seeding
- future server-side mutations

## Current Behavior

The app still behaves exactly like the v0.2 founder demo:

- UI screens continue to read from `lib/demo-data`
- demo actions still use the browser-local `lib/demo-state` fallback
- no page has been wired to the database yet
- no auth or server mutation layer has been added yet

## Repository-Backed Read Migration

The first screen group migrated to the repository abstraction is `/audit`:

- in `JOBSHOP_DATA_SOURCE=demo`, the audit route still behaves like the founder demo and can overlay runtime browser state in the existing client audit view
- in `JOBSHOP_DATA_SOURCE=database`, the audit route reads through the Prisma-backed repository layer
- other screens still read directly from `lib/demo-data` while the rest of the migration is staged one route group at a time

The first quote screens migrated to the repository abstraction are:

- `/quotes`
- `/quotes/q-1003`
- `/approvals`

In demo mode, those screens still preserve the localStorage-backed quote workflow overlay. The repository layer supplies the base quote list, quote detail, and approval queue read models, while quote approvals/conversions remain demo-state commands for now.

The next production read paths migrated to the repository abstraction are:

- `/capacity`
- `/jobs/j-2035`
- `/output/work-order-traveler/j-2035`

In demo mode, these screens still render the seeded founder-demo capacity and J-2035 production views exactly as before. The repository layer now supplies the base capacity planner, J-2035 job detail, and traveler read models, while the workflow mutations that change those records remain in the browser-local demo-state layer for now.

The next production read paths migrated to the repository abstraction are:

- `/quality`
- `/quality/j-2042/scrap-approval`
- `/quality/j-2042/rework-created`
- `/materials`
- `/materials/al-6061-plt-0.375`
- `/jobs/j-2099/material-impact`
- `/purchase-requests/pr-3091`

In demo mode, these screens still render the seeded founder-demo quality, material, and purchasing views exactly as before. The repository layer now supplies the base read models, while the workflow mutations that change those records remain in the browser-local demo-state layer for now.

The next production read paths migrated to the repository abstraction are:

- `/customer-service`
- `/customers/metrofab-industries`
- `/customer-service/jobs/j-2035`
- `/reports/customer-status/j-2035`
- `/reports/customer-status/j-2035/print`

In demo mode, these screens still render the seeded founder-demo customer service and customer reporting views exactly as before. The repository layer now supplies the base customer service, customer detail, customer-safe status, and customer report read models, while the report-generation workflow command remains in the browser-local demo-state layer for now.

## Data Source Modes

Phase 11B introduces a repository/read abstraction with two modes:

- `demo` mode: continue reading from `lib/demo-data` and `lib/demo-state`
- `database` mode: read from Prisma-backed repositories once route migration begins

`demo` mode remains the default so the founder demo keeps working without any database configuration.

Set `JOBSHOP_DATA_SOURCE=database` only when you are ready to read from Prisma-backed repositories. If `JOBSHOP_DATA_SOURCE=database` is set without `DATABASE_URL`, the app will fail clearly instead of silently falling back.

## Environment

Set the database connection before running migration or seed commands:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Prisma 7 uses a driver adapter for runtime queries. This project uses Neon via:

- `@prisma/adapter-neon`
- `@neondatabase/serverless`

Use the pooled Neon URL in `DATABASE_URL` for Prisma Client/runtime queries.
Use `DIRECT_URL` for Prisma CLI commands such as migration and introspection when you need a direct connection to Neon.

## Common Commands

```bash
npm run db:generate
npm run db:migrate:dev
npm run db:migrate:deploy
npm run db:seed
npm run db:studio
```

The repository layer lives under `lib/repositories/`:

- `lib/repositories/demo/*` wraps the existing demo-data helpers
- `lib/repositories/database/*` provides the Prisma-backed read path skeleton
- `lib/repositories/index.ts` selects the active mode
- `lib/data-source.ts` resolves `demo` vs `database`
- `lib/read-models/*` combines repository data into route-ready projections

## Seeding Strategy

The seed importer reads directly from the existing `lib/demo-data` exports so the relational dataset stays aligned with the demo fixtures. The importer is deterministic and can be rerun safely.

## Next Step

Phase 11G can start replacing the browser-local workflow transitions with transactional server mutations once the remaining seeded screen groups are fully repository-backed.

## Phase 12 Command Layer Plan

The next production step is a server command layer for database mode only.

Planned pieces:

- typed command results and command context
- command-specific validation, authorization, not-found, conflict, and replay errors
- transactional audit writes into `AuditEvent`
- idempotency tracking through `WorkflowCommand`
- one transaction wrapper that can run a mutation, write audit rows, and record command outcome atomically

Important behavior:

- UI wiring is not connected to these commands yet
- `JOBSHOP_DATA_SOURCE=demo` still uses the browser-local `lib/demo-state` workflow overlay
- server commands are for database mode later, once route actions are intentionally switched over
- the founder demo and demo-state reset flow remain available unchanged

## Phase 12B Status

`approveQuoteCommand()` is now implemented as the first transactional server command.

It runs only in database mode, uses `WorkflowCommand` idempotency, writes transactional `AuditEvent` rows, and records an approval history row for the quote. Demo mode and the browser-local quote workflow remain unchanged until the UI is intentionally rewired later.

## Phase 12C Status

`convertQuoteToJobCommand()` is now implemented as the second transactional server command.

It converts an approved quote into a job and work order in database mode, generates routing and material task records when the schema supports them, and writes the conversion audit trail transactionally. Demo mode and the browser-local quote workflow remain unchanged until the UI is intentionally rewired later.

## Phase 13A Status

Temporary database-mode HTTP endpoints now exist for quote command execution:

- `POST /api/commands/quotes/q-1003/approve`
- `POST /api/commands/quotes/q-1003/convert`

These endpoints call the existing server command layer in `JOBSHOP_DATA_SOURCE=database` and return typed JSON command results with transactional audit logging and idempotency. When `JOBSHOP_DATA_SOURCE=demo`, they return a clear 409 response so the browser-local `lib/demo-state` workflow remains the only demo path.

Until auth is added, the endpoints use temporary actor context values:

- approval: `Owner / GM`
- conversion: `Scheduler`

Idempotency is taken from the `Idempotency-Key` header when present and falls back to deterministic keys for the known Q-1003 demo commands.

## Phase 13B Status

The quote workflow UI now chooses the command path by data source mode:

- `JOBSHOP_DATA_SOURCE=demo` keeps using the browser-local `lib/demo-state` actions and localStorage overlay exactly as before.
- `JOBSHOP_DATA_SOURCE=database` uses the new server command endpoints and refreshes the repository-backed read models after a successful approve or convert command.

Database mode requires a seeded PostgreSQL database plus the configured Neon environment variables. Demo mode does not need database access and remains the founder demo path.

## Phase 13C Status

A route-level smoke test now verifies the quote command HTTP endpoints in database mode:

- `scripts/smoke-quote-command-routes.ts`
- `npm run smoke:quote-command-routes`

The smoke test requires `JOBSHOP_DATA_SOURCE=database`, `DATABASE_URL`, and an app base URL. It defaults to `http://localhost:3000` and posts to the quote command routes directly, then reruns the same requests to verify replay/idempotency behavior.

## Phase 14A Status

The first quality command now exists for database mode:

- `approveScrapAndCreateReworkCommand()`

It approves the J-2042 scrap exception, moves the job to Rework, links or creates `RW-2042-01`, and writes the quality/rework audit trail transactionally. Demo mode remains unchanged and still uses the browser-local `lib/demo-state` workflow.

## Phase 14B Status

A database-mode HTTP endpoint now exists for the J-2042 scrap approval flow:

- `POST /api/commands/quality/j-2042/approve-scrap`

It calls `approveScrapAndCreateReworkCommand()` with the seeded J-2042 and RW-2042-01 identifiers, uses `Shop Supervisor` as the temporary actor context, and returns a typed JSON command result. In demo mode it returns a clear 409 response so the localStorage workflow remains the only demo path.

## Phase 14C Status

Quality workflow smoke coverage now exists for both the command layer and the HTTP route:

- `scripts/smoke-quality-commands.ts`
- `scripts/smoke-quality-command-routes.ts`

These verify that database mode can approve J-2042 scrap, create or reuse RW-2042-01, and replay the command safely without duplicating effects. The Linux smoke workflow now runs the quality route smoke and quality command smoke alongside the quote checks.

The smoke scripts derive their idempotency keys from `SMOKE_RUN_ID` so a GitHub Actions rerun gets fresh keys while each script still reruns the same command twice internally to verify replay behavior.

## Phase 14D Status

The quality workflow UI now chooses the approval path by data source mode:

- `JOBSHOP_DATA_SOURCE=demo` keeps using the browser-local `lib/demo-state` action and localStorage overlay exactly as before.
- `JOBSHOP_DATA_SOURCE=database` uses `POST /api/commands/quality/j-2042/approve-scrap`, sends an idempotency key, and refreshes the repository-backed read models after a successful approval.

In database mode, the quality rework screen renders from the repository-backed read model directly so it does not overlay stale browser-local quality state on top of the refreshed server data.

Database mode still requires a seeded PostgreSQL database plus the configured Neon environment variables. Demo mode does not need database access and remains the founder demo path.

## Phase 15A Status

The first materials command now exists for database mode:

- `createPurchaseRequestCommand()`

It creates or reuses the seeded purchase request path for `J-2099` and `AL-6061-PLT-0.375`, links the request back to the blocked job, updates the job material status to `Purchase Requested`, and writes the purchasing audit trail transactionally. Demo mode remains unchanged and still uses the browser-local `lib/demo-state` workflow.

## Quote Command Smoke Test

After running migrations and seed against a real database, you can validate the quote approval and conversion commands with:

```bash
JOBSHOP_DATA_SOURCE=database DATABASE_URL=... npm run db:migrate:deploy
JOBSHOP_DATA_SOURCE=database DATABASE_URL=... npm run db:seed
JOBSHOP_DATA_SOURCE=database DATABASE_URL=... npm run smoke:quote-commands
```

The smoke script checks that Q-1003 approves and converts in database mode, that J-2104 and WO-2104 exist, and that rerunning the commands with the same idempotency keys does not duplicate command effects.

## Database Diagnostic

If you want to check whether Prisma Client can connect to the database without involving Prisma Migrate, run:

```bash
JOBSHOP_DATA_SOURCE=database DATABASE_URL=... npm run db:diagnostic
```

This diagnostic only checks Prisma Client connectivity by running a simple `SELECT 1` query. It does not prove migrations work.

If `db:diagnostic` passes but `db:migrate` still fails, the issue is likely in Prisma Migrate, the schema engine, or the CLI environment rather than Neon connectivity.

## GitHub Actions Migration Smoke

To run the Linux migration smoke path in GitHub Actions, add these repository secrets:

- `JOBSHOP_DATABASE_URL`: the Neon pooled URL used by Prisma Client/runtime queries
- `JOBSHOP_DIRECT_URL`: the Neon direct URL used by Prisma CLI migration/introspection commands

Then open the manual workflow in the repository Actions tab and run **DB Migration Smoke**.

The workflow runs on `ubuntu-latest` and executes:

1. `npm ci`
2. `npx prisma validate`
3. `npx prisma generate`
4. `npm run db:migrate:deploy`
5. `npm run db:seed`
6. `npm run smoke:quote-commands`

This exists to isolate the native Windows Prisma schema-engine failure mode from actual Neon connectivity or schema problems. If the Linux workflow passes but native Windows migrate still fails, the issue is likely the local Windows Prisma CLI/schema-engine environment rather than the schema or database.

## Migrate Dev vs Deploy

- Use `npm run db:migrate:dev` during local development when you are iterating on schema changes.
- Use `npm run db:migrate:deploy` in CI, staging, and production where commands must be non-interactive.
- If Neon has a migration recorded that is missing locally, either use a fresh disposable branch/database or reconcile the migration history before running deploy. Do not use `migrate dev` in CI to try to recover from drift because it is interactive and can prompt for a destructive reset.
