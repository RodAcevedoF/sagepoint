export * from "./generated/prisma/client";
export { PrismaPg } from "@prisma/adapter-pg";

// Shared repository adapters
export { PrismaCategoryRepository } from "./repositories/prisma-category.repository";
export { PrismaNewsArticleRepository } from "./repositories/prisma-news-article.repository";
