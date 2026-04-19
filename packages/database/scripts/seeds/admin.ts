import type { Client } from "pg";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";

const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || "admin@sagepoint.dev",
  password: process.env.ADMIN_PASSWORD || "Admin123!",
  name: process.env.ADMIN_NAME || "Admin",
};

export async function seedAdmin(client: Client): Promise<void> {
  console.log("Creating admin user...");

  const { rows } = await client.query("SELECT 1 FROM users WHERE email = $1", [
    ADMIN_USER.email,
  ]);

  if (rows.length > 0) {
    console.log(`  Admin user already exists: ${ADMIN_USER.email}\n`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_USER.password, 10);

  await client.query(
    `INSERT INTO users (id, email, name, password, role, "isActive", "isVerified", "onboardingStatus", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', true, true, 'COMPLETED', now(), now())`,
    [randomUUID(), ADMIN_USER.email, ADMIN_USER.name, passwordHash],
  );

  console.log(`  Admin user created: ${ADMIN_USER.email}\n`);
}
