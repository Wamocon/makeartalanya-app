#!/usr/bin/env node
/**
 * Applies one SQL file to the database in DB_URL.
 *
 *   node scripts/db-apply.mjs supabase/migrations/0024_gallery_items.sql
 *
 * Exists because this machine has neither psql nor the Supabase CLI, and
 * pasting DDL into the dashboard by hand is not something you can re-run or
 * review in a diff. The migrations here are written to be idempotent
 * (IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT), so a repeat run is a
 * no-op rather than an error.
 *
 * The whole file goes in one transaction: a migration that half-applies leaves
 * the schema in a state no later migration is written to expect.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node scripts/db-apply.mjs <file.sql>");
    process.exit(1);
  }

  await loadEnv();
  if (!process.env.DB_URL) {
    console.error("DB_URL is not set in .env.local");
    process.exit(1);
  }

  const sql = await readFile(path.resolve(process.cwd(), file), "utf8");

  // Supabase terminates non-TLS connections. `rejectUnauthorized: false` is the
  // documented setting for their pooler cert chain.
  const client = new pg.Client({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log(`✓ applied ${file}`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(`✗ ${file} rolled back\n`);
    console.error(err.message);
    if (err.position) console.error(`  at character ${err.position}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
