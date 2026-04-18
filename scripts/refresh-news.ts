import { config } from "dotenv";
config({ path: ".env" });

import { TavilyNewsAdapter } from "@sagepoint/ai";
import {
  PrismaClient,
  PrismaPg,
  PrismaCategoryRepository,
  PrismaNewsArticleRepository,
} from "@sagepoint/database";
import { InsightsRefreshService } from "../apps/worker/src/insights-refresh/insights-refresh.service";

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const auth = u.username ? "***@" : "";
    return `${u.protocol}//${auth}${u.host}${u.pathname}`;
  } catch {
    return "<invalid url>";
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  if (!tavilyApiKey) throw new Error("TAVILY_API_KEY is not set");

  console.log(`[refresh-news] target db: ${maskUrl(databaseUrl)}`);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  const newsService = new TavilyNewsAdapter({ apiKey: tavilyApiKey });
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const newsArticleRepo = new PrismaNewsArticleRepository(prisma);
  const service = new InsightsRefreshService(
    newsService,
    categoryRepo,
    newsArticleRepo,
  );

  try {
    await service.refreshNewsCache();
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
