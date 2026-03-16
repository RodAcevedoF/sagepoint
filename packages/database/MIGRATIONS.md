# Database Migrations

Custom lightweight migration runner using `pg` + `tsx`. Prisma remains the schema source of truth and client generator; the runner handles DDL execution and history tracking.

## Quick Reference

```bash
# Check current state
pnpm db:migrate:status

# Apply pending migrations
pnpm db:migrate:up

# Create a new migration
pnpm --filter @sagepoint/database migrate:create <name> -- --author <name>

# Validate checksums
pnpm --filter @sagepoint/database migrate:validate

# Rollback last migration (requires --force)
pnpm --filter @sagepoint/database migrate:down -- --force
```

## Workflow

1. Edit `schema.prisma`
2. Generate diff SQL:
   ```bash
   pnpm --filter @sagepoint/database exec prisma migrate diff \
     --from-url "$DATABASE_URL" \
     --to-schema-datamodel prisma/schema.prisma \
     --script
   ```
3. Create migration:
   ```bash
   pnpm --filter @sagepoint/database migrate:create add_user_bio -- --author racevedo
   ```
4. Paste SQL into `up.sql`, write reverse in `down.sql`
5. Apply: `pnpm db:migrate:up`
6. Regenerate client: `pnpm --filter @sagepoint/database db:generate`

## Baseline

The `20260315000000_baseline` migration contains the full schema. For existing databases (already created via `db:push`), apply with `--baseline` to record without executing:

```bash
pnpm db:migrate:up -- --baseline --author racevedo
```

On fresh databases (CI), the migration runs normally and creates all tables.

## File Structure

```
migrations/
└── YYYYMMDDHHmmss_description/
    ├── up.sql      # Forward migration
    └── down.sql    # Rollback migration
```

## Control Table

Applied migrations are tracked in `_sagepoint_migrations` with name, timestamp, author, SHA-256 checksum, and execution time.
