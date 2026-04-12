/**
 * db:bootstrap — for existing databases that predate the migration tracker.
 *
 * Stamps all migrations except the last N as "already applied" (without
 * running their SQL), then calls migrate:up to apply any pending ones.
 *
 * Usage:
 *   tsx scripts/bootstrap.ts            # stamps all but last 1, then migrate:up
 *   tsx scripts/bootstrap.ts --pending=3 # stamps all but last 3
 *
 * This is safe to re-run: already-stamped migrations are skipped.
 */

import { createHash } from "crypto";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { Client } from "pg";
import { migrateUp } from "./migration-runner";

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");
const CONTROL_TABLE = "_sagepoint_migrations";

const CREATE_CONTROL_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${CONTROL_TABLE} (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL UNIQUE,
  applied_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  applied_by   VARCHAR(100) NOT NULL DEFAULT 'unknown',
  checksum     VARCHAR(64)  NOT NULL,
  execution_ms INT
);
`;

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function loadMigrationNames(): { name: string; checksum: string }[] {
  if (!existsSync(MIGRATIONS_DIR)) return [];
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((name) => {
      const upPath = join(MIGRATIONS_DIR, name, "up.sql");
      if (!existsSync(upPath))
        throw new Error(`Missing up.sql in migration ${name}`);
      return { name, checksum: sha256(readFileSync(upPath, "utf-8")) };
    });
}

function parsePendingArg(): number {
  const arg = process.argv.slice(2).find((a) => a.startsWith("--pending="));
  if (!arg) return 1;
  const n = parseInt(arg.split("=")[1] ?? "1", 10);
  if (!Number.isFinite(n) || n < 0)
    throw new Error("--pending must be a non-negative integer");
  return n;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const pendingCount = parsePendingArg();
  const migrations = loadMigrationNames();

  if (migrations.length === 0) {
    console.log("No migrations found on disk.");
    return;
  }

  const toStamp = migrations.slice(0, migrations.length - pendingCount);
  const toPending = migrations.slice(migrations.length - pendingCount);

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(CREATE_CONTROL_TABLE_SQL);

    let stamped = 0;
    let skipped = 0;

    for (const { name, checksum } of toStamp) {
      const existing = await client.query(
        `SELECT checksum FROM ${CONTROL_TABLE} WHERE name = $1`,
        [name],
      );
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }
      await client.query(
        `INSERT INTO ${CONTROL_TABLE} (name, applied_by, checksum) VALUES ($1, 'bootstrap', $2)`,
        [name, checksum],
      );
      stamped++;
    }

    if (stamped > 0) console.log(`Stamped ${stamped} existing migration(s).`);
    if (skipped > 0)
      console.log(`Skipped ${skipped} already-tracked migration(s).`);

    if (toPending.length > 0) {
      console.log(
        `\nApplying ${toPending.length} pending migration(s): ${toPending.map((m) => m.name).join(", ")}`,
      );
    }
  } finally {
    await client.end();
  }

  // Run migrate:up to apply any unstamped migrations
  console.log("\nRunning migrate:up...");
  const result = await migrateUp({ author: "bootstrap" });

  if (result.applied.length === 0) {
    console.log("  No pending migrations — database is up to date.");
  } else {
    console.log(`\nApplied ${result.applied.length} migration(s):`);
    result.applied.forEach((name) => console.log(`  + ${name}`));
  }
}

main().catch((err) => {
  console.error("Bootstrap error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
