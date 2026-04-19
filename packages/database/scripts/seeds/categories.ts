import type { Client } from "pg";
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
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "LLMs, generative AI, and AI research",
  },
  {
    name: "Game Development",
    slug: "game-development",
    description: "Game engines, graphics, and interactive design",
  },
  {
    name: "UI/UX Design",
    slug: "ui-ux-design",
    description: "Design systems, accessibility, and user research",
  },
  {
    name: "Blockchain & Web3",
    slug: "blockchain",
    description: "Smart contracts, DeFi, and decentralized systems",
  },
  {
    name: "Software Testing",
    slug: "software-testing",
    description: "QA, automation, and test-driven development",
  },
];

export async function seedCategories(client: Client): Promise<void> {
  console.log("Creating categories...");
  let created = 0;
  let skipped = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const { rows } = await client.query(
      "SELECT 1 FROM categories WHERE slug = $1",
      [category.slug],
    );

    if (rows.length > 0) {
      skipped++;
      continue;
    }

    await client.query(
      `INSERT INTO categories (id, name, slug, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())`,
      [randomUUID(), category.name, category.slug, category.description],
    );
    created++;
  }

  console.log(`  Created: ${created}, Skipped: ${skipped}\n`);
}
