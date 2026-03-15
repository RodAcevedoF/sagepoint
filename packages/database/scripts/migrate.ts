import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  migrateUp,
  migrateDown,
  migrateStatus,
  migrateValidate,
} from "./migration-runner";

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2);

function parseFlag(flag: string): string | undefined {
  const entry = rest.find((a) => a.startsWith(`--${flag}`));
  if (!entry) return undefined;
  if (entry.includes("=")) return entry.split("=")[1];
  const idx = rest.indexOf(entry);
  return rest[idx + 1];
}

function hasFlag(flag: string): boolean {
  return rest.some((a) => a === `--${flag}`);
}

function positional(): string | undefined {
  return rest.find((a) => !a.startsWith("--"));
}

async function main() {
  switch (command) {
    case "create": {
      const name = positional();
      if (!name) {
        console.error("Usage: migrate create <name> [--author <name>]");
        process.exit(1);
      }
      const author = parseFlag("author") ?? "unknown";
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      const dirName = `${timestamp}_${name}`;
      const dirPath = join(MIGRATIONS_DIR, dirName);

      mkdirSync(dirPath, { recursive: true });

      const header = `-- Migration: ${dirName}\n-- Author: ${author}\n-- Created: ${new Date().toISOString()}\n\n`;

      writeFileSync(
        join(dirPath, "up.sql"),
        header + "-- Write your UP migration here\n",
      );
      writeFileSync(
        join(dirPath, "down.sql"),
        header + "-- Write your DOWN migration here\n",
      );

      console.log(`Created migration: ${dirName}`);
      console.log(`  ${dirPath}/up.sql`);
      console.log(`  ${dirPath}/down.sql`);
      break;
    }

    case "up": {
      const to = parseFlag("to");
      const author = parseFlag("author");
      const baseline = hasFlag("baseline");

      console.log("Running migrations...");
      const result = await migrateUp({ to, author, baseline });

      if (result.applied.length === 0) {
        console.log("  No pending migrations.");
      } else {
        console.log(`\nApplied ${result.applied.length} migration(s).`);
      }
      break;
    }

    case "down": {
      const stepsFlag = parseFlag("steps");
      let steps = 1;
      if (stepsFlag !== undefined) {
        const parsed = Number(stepsFlag);
        if (
          !Number.isFinite(parsed) ||
          !Number.isInteger(parsed) ||
          parsed <= 0
        ) {
          console.error(
            "Usage: migrate down [--steps <positive integer>] [--force]",
          );
          process.exit(1);
        }
        steps = parsed;
      }
      const force = hasFlag("force");

      console.log(`Rolling back ${steps} migration(s)...`);
      const rolled = await migrateDown({ steps, force });
      console.log(`\nRolled back ${rolled.length} migration(s).`);
      break;
    }

    case "status": {
      await migrateStatus();
      break;
    }

    case "validate": {
      const valid = await migrateValidate();
      if (!valid) process.exit(1);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error("Usage: migrate <create|up|down|status|validate>");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Migration error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
