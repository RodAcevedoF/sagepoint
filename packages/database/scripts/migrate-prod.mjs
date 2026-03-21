/**
 * Standalone migration runner for production (no tsx needed).
 * Usage: node migrate-prod.mjs <up|status> [--author <name>]
 *
 * Expects:
 *   - DATABASE_URL env var
 *   - ../migrations/ directory with migration folders
 */
import { createHash } from "crypto";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "migrations");
const CONTROL_TABLE = "_sagepoint_migrations";
const ADVISORY_LOCK_KEY = 42000000001;

const CREATE_CONTROL_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${CONTROL_TABLE} (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL UNIQUE,
    applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_by    VARCHAR(100) NOT NULL DEFAULT 'unknown',
    checksum      VARCHAR(64)  NOT NULL,
    execution_ms  INT
);`;

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function loadMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) return [];
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((name) => {
      const upPath = join(MIGRATIONS_DIR, name, "up.sql");
      if (!existsSync(upPath)) throw new Error(`Missing up.sql in ${name}`);
      const upSql = readFileSync(upPath, "utf-8");
      return { name, upSql, checksum: sha256(upSql) };
    });
}

async function run() {
  const [command, ...rest] = process.argv.slice(2);
  const author = rest.includes("--author") ? rest[rest.indexOf("--author") + 1] : "deploy";

  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_KEY]);
    await client.query(CREATE_CONTROL_TABLE_SQL);

    const { rows: applied } = await client.query(
      `SELECT name, checksum FROM ${CONTROL_TABLE} ORDER BY id ASC`
    );
    const appliedNames = new Set(applied.map((r) => r.name));
    const migrations = loadMigrations();

    if (command === "status") {
      console.log("\nMigration Status\n" + "-".repeat(60));
      for (const m of migrations) {
        const a = applied.find((r) => r.name === m.name);
        console.log(a ? `  + ${m.name}  (applied)` : `  o ${m.name}  (pending)`);
      }
      console.log(`\n${applied.length} applied, ${migrations.filter((m) => !appliedNames.has(m.name)).length} pending\n`);
    } else if (command === "up") {
      let count = 0;
      for (const m of migrations) {
        if (appliedNames.has(m.name)) continue;
        const start = Date.now();
        await client.query("BEGIN");
        try {
          await client.query(m.upSql);
          await client.query(
            `INSERT INTO ${CONTROL_TABLE} (name, applied_by, checksum, execution_ms) VALUES ($1, $2, $3, $4)`,
            [m.name, author, m.checksum, Date.now() - start]
          );
          await client.query("COMMIT");
          console.log(`  + ${m.name} — applied (${Date.now() - start}ms)`);
          count++;
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(`  x ${m.name} — FAILED: ${err.message}`);
          process.exit(1);
        }
      }
      console.log(count === 0 ? "No pending migrations." : `\nApplied ${count} migration(s).`);
    } else {
      console.error("Usage: node migrate-prod.mjs <up|status> [--author <name>]");
      process.exit(1);
    }
  } finally {
    try { await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]); } catch {}
    await client.end();
  }
}

run().catch((err) => { console.error("Migration error:", err.message); process.exit(1); });
