# JobShop OS Release Checklist

Use this checklist before cutting a production release.

## Required Environment Variables

- `JOBSHOP_DATA_SOURCE`
- `DATABASE_URL`
- `DIRECT_URL`
- `JOBSHOP_COMMAND_ACTOR_HEADER_ENABLED`
- any other application environment variables already documented in [`docs/production-hardening.md`](./production-hardening.md)

## Database Release Flow

For deployment and release validation:

1. run `npm run db:migrate:deploy`
2. run `npm run db:seed` only for demo, staging, or smoke-data refreshes
3. do not run `db:seed` against production unless that is explicitly intended

## Smoke Tests

Run the Linux DB smoke path before release:

- DB Migration Smoke
- route smoke scripts
- command smoke scripts

These checks verify the database-mode command routes, idempotency, audit logging, and repository-backed reads.

## Security Checks

- command routes fail closed without an authenticated actor
- the actor header override must remain disabled in production
- secrets must not be committed to git

## Demo Mode vs Database Mode

- demo mode continues to use the browser-local `lib/demo-state` workflow overlay
- database mode uses Prisma-backed repositories and server-side commands
- the demo workflow should remain available unchanged

## Rollback Notes

- keep release tags available for rollback references
- treat migration deploys carefully because they are persistent schema changes
- use a fresh Neon branch or a restore point when validating risky schema changes

## Known Windows Limitations

- Next.js production builds may require an elevated rerun on Windows because of `spawn EPERM`
- Linux CI remains the source of truth for database smoke validation

