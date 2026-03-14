import { PrismaClient } from '@sagepoint/database';
import type { PrismaService } from '@/core/infra/database/prisma.service';

let client: PrismaClient;

/**
 * Returns a shared PrismaClient connected to the test database.
 * Uses DATABASE_URL from the environment (docker-compose Postgres).
 */
export function getPrismaClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}

/**
 * Cast to PrismaService for repository constructors.
 * PrismaService extends PrismaClient, so the cast is safe.
 */
export function asPrismaService(): PrismaService {
  return getPrismaClient() as unknown as PrismaService;
}

export async function connectPrisma(): Promise<void> {
  await getPrismaClient().$connect();
}

export async function disconnectPrisma(): Promise<void> {
  await getPrismaClient().$disconnect();
}

/**
 * Truncate all tables (in dependency order) for test isolation.
 * Uses TRUNCATE CASCADE so foreign key constraints are respected.
 */
export async function cleanDatabase(): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      step_quiz_attempts,
      user_roadmap_progress,
      resources,
      quiz_attempts,
      questions,
      quizzes,
      document_summaries,
      roadmaps,
      documents,
      user_interests,
      user_preferences,
      users,
      categories
    CASCADE
  `);
}
