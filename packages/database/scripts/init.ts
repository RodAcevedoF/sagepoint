import { Client } from "pg";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const DEFAULT_CATEGORIES = [
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and full-stack web development",
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "iOS, Android, and cross-platform mobile apps",
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    description: "AI, deep learning, and neural networks",
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Data analysis, visualization, and statistics",
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "CI/CD, cloud infrastructure, and deployment",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Security, penetration testing, and cryptography",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "AWS, Azure, GCP, and cloud architecture",
  },
  {
    name: "Databases",
    slug: "databases",
    description: "SQL, NoSQL, and database design",
  },
  {
    name: "Programming Languages",
    slug: "programming-languages",
    description: "Python, JavaScript, Rust, Go, and more",
  },
  {
    name: "System Design",
    slug: "system-design",
    description: "Architecture, scalability, and distributed systems",
  },
];

const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || "admin@sagepoint.dev",
  password: process.env.ADMIN_PASSWORD || "Admin123!",
  name: process.env.ADMIN_NAME || "Admin",
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    console.log("Initializing Sagepoint...\n");

    // 1. Create Categories
    console.log("Creating categories...");
    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const category of DEFAULT_CATEGORIES) {
      const { rows } = await client.query(
        "SELECT 1 FROM categories WHERE slug = $1",
        [category.slug],
      );

      if (rows.length > 0) {
        categoriesSkipped++;
        continue;
      }

      await client.query(
        `INSERT INTO categories (id, name, slug, description, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, now(), now())`,
        [randomUUID(), category.name, category.slug, category.description],
      );
      categoriesCreated++;
    }

    console.log(
      `  Created: ${categoriesCreated}, Skipped: ${categoriesSkipped}\n`,
    );

    // 2. Create Admin User
    console.log("Creating admin user...");
    const { rows: existing } = await client.query(
      "SELECT 1 FROM users WHERE email = $1",
      [ADMIN_USER.email],
    );

    if (existing.length > 0) {
      console.log(`  Admin user already exists: ${ADMIN_USER.email}\n`);
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_USER.password, 10);

      await client.query(
        `INSERT INTO users (id, email, name, password, role, "isActive", "isVerified", "onboardingStatus", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'ADMIN', true, true, 'COMPLETED', now(), now())`,
        [randomUUID(), ADMIN_USER.email, ADMIN_USER.name, passwordHash],
      );
      console.log("Admin user created");
    }

    console.log("Sagepoint initialization complete!\n");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Initialization failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
