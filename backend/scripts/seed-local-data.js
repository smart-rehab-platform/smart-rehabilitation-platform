#!/usr/bin/env node
/**
 * LOCAL-ONLY database seed runner.
 *
 * Loads database/seeds/local_test_data.sql into your local PostgreSQL database.
 * Safe to re-run: the SQL file deletes fixed seed UUIDs before inserting.
 *
 * Usage (from repo root):
 *   node backend/scripts/seed-local-data.js
 *
 * Requires backend/.env with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const PASSWORD = "Test123456!";
const SQL_PATH = path.join(__dirname, "../../database/seeds/local_test_data.sql");

async function ensurePasswordHash(client) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const emails = [
    "admin@test.com",
    "bana.specialist@test.com",
    "sara.specialist@test.com",
    "fatima.parent@test.com",
    "omar.parent@test.com",
  ];

  await client.query(
    `UPDATE users SET password_hash = $1 WHERE email = ANY($2::text[])`,
    [hash, emails]
  );
}

async function main() {
  if (!process.env.DB_NAME) {
    console.error(
      "Missing database config. Create backend/.env with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD."
    );
    process.exit(1);
  }

  if (!fs.existsSync(SQL_PATH)) {
    console.error(`Seed file not found: ${SQL_PATH}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(SQL_PATH, "utf8");
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const client = await pool.connect();

  try {
    console.log("Running local test seed...");
    await client.query("BEGIN");
    await client.query(sql);
    await ensurePasswordHash(client);
    await client.query("COMMIT");

    console.log("");
    console.log("Local seed completed successfully.");
    console.log("");
    console.log("Demo accounts (password for all: Test123456!):");
    console.log("  Admin:      admin@test.com");
    console.log("  Specialist: bana.specialist@test.com  (Bana Specialist)");
    console.log("  Specialist: sara.specialist@test.com");
    console.log("  Parent:     fatima.parent@test.com   (children: Omar & Layla)");
    console.log("  Parent:     omar.parent@test.com     (child: Youssef)");
    console.log("");
    console.log("Bana Specialist dashboard should show:");
    console.log("  - Active Cases: 3");
    console.log("  - Pending Reviews: 3");
    console.log("  - Today's Sessions: 3 (uses CURRENT_DATE)");
    console.log("  - Treatment Plans: 3");
    console.log("  - Recent Patient Progress: 3 patients");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
