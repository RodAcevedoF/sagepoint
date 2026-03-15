import { createHash } from "crypto";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { Client } from "pg";

const ADVISORY_LOCK_KEY = 42_000_000_001;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MigrationRecord {
  name: string;
  applied_at: Date;
  checksum: string;
  execution_ms: number | null;
}

interface MigrationFile {
  name: string;
  upPath: string;
  downPath: string;
  upSql: string;
  downSql: string;
  checksum: string;
}

interface ApplyResult {
  applied: string[];
  skipped: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

const CONTROL_TABLE = "_sagepoint_migrations";

const CREATE_CONTROL_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${CONTROL_TABLE} (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL UNIQUE,
    applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_by    VARCHAR(100) NOT NULL DEFAULT 'unknown',
    checksum      VARCHAR(64)  NOT NULL,
    execution_ms  INT
);
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function loadMigrationsFromDisk(): MigrationFile[] {
  if (!existsSync(MIGRATIONS_DIR)) return [];

  const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  return dirs.map((name) => {
    const upPath = join(MIGRATIONS_DIR, name, "up.sql");
    const downPath = join(MIGRATIONS_DIR, name, "down.sql");

    if (!existsSync(upPath)) {
      throw new Error(`Missing up.sql in migration ${name}`);
    }

    const upSql = readFileSync(upPath, "utf-8");
    const downSql = existsSync(downPath) ? readFileSync(downPath, "utf-8") : "";

    return { name, upPath, downPath, upSql, downSql, checksum: sha256(upSql) };
  });
}

async function createClient(): Promise<Client> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
}

// ---------------------------------------------------------------------------
// Core runner
// ---------------------------------------------------------------------------

async function ensureControlTable(client: Client): Promise<void> {
  await client.query(CREATE_CONTROL_TABLE_SQL);
}

async function getAppliedMigrations(
  client: Client,
): Promise<MigrationRecord[]> {
  const { rows } = await client.query<MigrationRecord>(
    `SELECT name, applied_at, checksum, execution_ms FROM ${CONTROL_TABLE} ORDER BY id ASC`,
  );
  return rows;
}

export async function migrateUp(options: {
  to?: string;
  author?: string;
  baseline?: boolean;
}): Promise<ApplyResult> {
  const client = await createClient();
  const result: ApplyResult = { applied: [], skipped: [] };

  await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_KEY]);
  try {
    await ensureControlTable(client);
    const applied = await getAppliedMigrations(client);
    const appliedByName = new Map(applied.map((r) => [r.name, r]));
    const migrations = loadMigrationsFromDisk();

    if (options.to && !migrations.some((m) => m.name === options.to)) {
      throw new Error(`Target migration "${options.to}" not found on disk.`);
    }

    for (const migration of migrations) {
      const appliedRecord = appliedByName.get(migration.name);
      if (appliedRecord) {
        if (appliedRecord.checksum !== migration.checksum) {
          throw new Error(
            `Checksum mismatch for applied migration "${migration.name}". ` +
              `DB=${appliedRecord.checksum}, disk=${migration.checksum}. ` +
              "The migration file was modified after it was applied.",
          );
        }
        result.skipped.push(migration.name);
        if (options.to && migration.name === options.to) break;
        continue;
      }

      const isBaseline =
        options.baseline && migration.name.includes("baseline");
      const start = Date.now();

      await client.query("BEGIN");
      try {
        if (!isBaseline) {
          await client.query(migration.upSql);
        }

        await client.query(
          `INSERT INTO ${CONTROL_TABLE} (name, applied_by, checksum, execution_ms)
           VALUES ($1, $2, $3, $4)`,
          [
            migration.name,
            options.author ?? "unknown",
            migration.checksum,
            Date.now() - start,
          ],
        );

        await client.query("COMMIT");
        result.applied.push(migration.name);

        const label = isBaseline ? "baseline (record only)" : "applied";
        console.log(
          `  ✓ ${migration.name} — ${label} (${Date.now() - start}ms)`,
        );
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration ${migration.name} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      if (options.to && migration.name === options.to) break;
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]);
    } catch {
      // Lock released on disconnect anyway
    }
    await client.end();
  }

  return result;
}

export async function migrateDown(options: {
  steps?: number;
  force?: boolean;
}): Promise<string[]> {
  if (!options.force) {
    throw new Error(
      "Rollback requires --force flag to prevent accidental data loss",
    );
  }

  const client = await createClient();
  const rolled: string[] = [];
  const steps = options.steps ?? 1;

  await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_KEY]);
  try {
    await ensureControlTable(client);
    const applied = await getAppliedMigrations(client);

    if (applied.length === 0) {
      console.log("  No migrations to roll back.");
      return rolled;
    }

    const migrations = loadMigrationsFromDisk();
    const migrationMap = new Map(migrations.map((m) => [m.name, m]));
    const toRollback = applied.slice(-steps).reverse();

    for (const record of toRollback) {
      const migration = migrationMap.get(record.name);
      if (!migration) {
        throw new Error(`Migration file not found for ${record.name}`);
      }
      if (!migration.downSql.trim()) {
        throw new Error(`No down.sql for migration ${record.name}`);
      }

      const start = Date.now();

      await client.query("BEGIN");
      try {
        await client.query(migration.downSql);
        await client.query(`DELETE FROM ${CONTROL_TABLE} WHERE name = $1`, [
          record.name,
        ]);
        await client.query("COMMIT");
        rolled.push(record.name);
        console.log(
          `  ✓ ${record.name} — rolled back (${Date.now() - start}ms)`,
        );
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `Rollback of ${record.name} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]);
    } catch {
      // Lock released on disconnect anyway
    }
    await client.end();
  }

  return rolled;
}

export async function migrateStatus(): Promise<void> {
  const client = await createClient();

  try {
    await ensureControlTable(client);
    const applied = await getAppliedMigrations(client);
    const appliedNames = new Set(applied.map((r) => r.name));
    const migrations = loadMigrationsFromDisk();

    console.log("\nMigration Status\n" + "─".repeat(60));

    for (const migration of migrations) {
      const record = applied.find((r) => r.name === migration.name);
      if (record) {
        const date = new Date(record.applied_at)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        console.log(`  ✓ ${migration.name}  (applied ${date})`);
      } else {
        console.log(`  ○ ${migration.name}  (pending)`);
      }
    }

    // Check for applied migrations not on disk
    for (const record of applied) {
      if (!migrations.some((m) => m.name === record.name)) {
        console.log(`  ✗ ${record.name}  (applied but missing from disk!)`);
      }
    }

    const pending = migrations.filter((m) => !appliedNames.has(m.name));
    console.log(
      `\n${applied.length} applied, ${pending.length} pending, ${migrations.length} total\n`,
    );
  } finally {
    await client.end();
  }
}

export async function migrateValidate(): Promise<boolean> {
  const client = await createClient();
  let valid = true;

  try {
    await ensureControlTable(client);
    const applied = await getAppliedMigrations(client);
    const migrations = loadMigrationsFromDisk();
    const migrationMap = new Map(migrations.map((m) => [m.name, m]));

    console.log("\nChecksum Validation\n" + "─".repeat(60));

    for (const record of applied) {
      const migration = migrationMap.get(record.name);
      if (!migration) {
        console.log(`  ✗ ${record.name} — file missing from disk`);
        valid = false;
        continue;
      }

      if (migration.checksum !== record.checksum) {
        console.log(`  ✗ ${record.name} — checksum mismatch`);
        console.log(`      db:   ${record.checksum}`);
        console.log(`      disk: ${migration.checksum}`);
        valid = false;
      } else {
        console.log(`  ✓ ${record.name} — ok`);
      }
    }

    console.log(valid ? "\nAll checksums valid.\n" : "\nValidation FAILED.\n");
  } finally {
    await client.end();
  }

  return valid;
}
