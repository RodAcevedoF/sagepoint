import "./env";
import { Client } from "pg";
import { seedCategories } from "./seeds/categories";
import { seedAdmin } from "./seeds/admin";
import { seedBlogPosts } from "./seeds/blog-posts";

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
    await seedCategories(client);
    await seedAdmin(client);
    await seedBlogPosts(client);
    console.log("Sagepoint initialization complete!\n");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Initialization failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
