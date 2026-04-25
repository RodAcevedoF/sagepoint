#!/usr/bin/env node
/**
 * Compiles MJML email sources to static HTML. Runs before `nest build` so the
 * generated .html files are copied into dist/ by nest's asset step, and read
 * at runtime by ResendEmailService via readFileSync.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import mjml2html from "mjml";

const here = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(
  here,
  "..",
  "src",
  "features",
  "auth",
  "infra",
  "driven",
  "templates",
);

const sources = readdirSync(templatesDir).filter((f) => f.endsWith(".mjml"));
if (sources.length === 0) {
  console.warn("[email-templates] No .mjml sources found — nothing to do.");
  process.exit(0);
}

let failed = 0;
for (const source of sources) {
  const srcPath = join(templatesDir, source);
  const outPath = join(templatesDir, `${basename(source, ".mjml")}.html`);
  const mjml = readFileSync(srcPath, "utf-8");
  const { html, errors } = await mjml2html(mjml, { validationLevel: "soft" });

  if (errors && errors.length > 0) {
    failed++;
    console.error(`[email-templates] ${source} — ${errors.length} error(s):`);
    for (const e of errors) console.error(`  · ${e.formattedMessage ?? e.message}`);
    continue;
  }

  writeFileSync(outPath, html);
  console.log(`[email-templates] ${source} → ${basename(outPath)}`);
}

if (failed > 0) process.exit(1);
