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

## Common Commands

```bash
npm run db:generate
npm run db:migrate
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
