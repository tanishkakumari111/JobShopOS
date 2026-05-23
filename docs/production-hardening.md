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

## Seeding Strategy

The seed importer reads directly from the existing `lib/demo-data` exports so the relational dataset stays aligned with the demo fixtures. The importer is deterministic and can be rerun safely.

## Next Step

Phase 11B will introduce the server-side repository and query layer so the app can start reading from Postgres without losing the founder-demo fallback behavior. Route reads will move one screen group at a time after the repository abstraction is in place.
