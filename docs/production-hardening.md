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

## Seeding Strategy

The seed importer reads directly from the existing `lib/demo-data` exports so the relational dataset stays aligned with the demo fixtures. The importer is deterministic and can be rerun safely.

## Next Step

Phase 11B will introduce the server-side repository and query layer so the app can start reading from Postgres without losing the founder-demo fallback behavior.
