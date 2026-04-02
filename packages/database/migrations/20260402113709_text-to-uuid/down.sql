-- Migration: 20260402113709_text-to-uuid (ROLLBACK)
-- Author: raacevedo
-- Created: 2026-04-02T11:37:09.702Z
--
-- Revert native UUID columns back to TEXT.

BEGIN;

-- Drop FKs
ALTER TABLE "user_interests" DROP CONSTRAINT IF EXISTS "user_interests_userId_fkey";
ALTER TABLE "user_interests" DROP CONSTRAINT IF EXISTS "user_interests_categoryId_fkey";
ALTER TABLE "user_preferences" DROP CONSTRAINT IF EXISTS "user_preferences_userId_fkey";
ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_userId_fkey";
ALTER TABLE "document_summaries" DROP CONSTRAINT IF EXISTS "document_summaries_documentId_fkey";
ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "quizzes_documentId_fkey";
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_quizId_fkey";
ALTER TABLE "quiz_attempts" DROP CONSTRAINT IF EXISTS "quiz_attempts_quizId_fkey";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parentId_fkey";
ALTER TABLE "roadmaps" DROP CONSTRAINT IF EXISTS "roadmaps_userId_fkey";
ALTER TABLE "roadmaps" DROP CONSTRAINT IF EXISTS "roadmaps_documentId_fkey";
ALTER TABLE "roadmaps" DROP CONSTRAINT IF EXISTS "roadmaps_categoryId_fkey";
ALTER TABLE "resources" DROP CONSTRAINT IF EXISTS "resources_roadmapId_fkey";
ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT IF EXISTS "user_roadmap_progress_roadmapId_fkey";
ALTER TABLE "step_quiz_attempts" DROP CONSTRAINT IF EXISTS "step_quiz_attempts_roadmapId_fkey";
ALTER TABLE "news_articles" DROP CONSTRAINT IF EXISTS "news_articles_categoryId_fkey";
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_invitedById_fkey";
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_acceptedById_fkey";

-- Revert PKs to TEXT
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "user_preferences" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "documents" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "document_summaries" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "quizzes" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "questions" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "quiz_attempts" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "categories" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "news_articles" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "roadmaps" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "resources" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "step_quiz_attempts" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "invitations" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::text, ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Revert FKs to TEXT
ALTER TABLE "user_interests" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text, ALTER COLUMN "categoryId" SET DATA TYPE TEXT USING "categoryId"::text;
ALTER TABLE "user_preferences" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text;
ALTER TABLE "documents" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text;
ALTER TABLE "document_summaries" ALTER COLUMN "documentId" SET DATA TYPE TEXT USING "documentId"::text;
ALTER TABLE "quizzes" ALTER COLUMN "documentId" SET DATA TYPE TEXT USING "documentId"::text;
ALTER TABLE "questions" ALTER COLUMN "quizId" SET DATA TYPE TEXT USING "quizId"::text;
ALTER TABLE "quiz_attempts" ALTER COLUMN "quizId" SET DATA TYPE TEXT USING "quizId"::text, ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text;
ALTER TABLE "categories" ALTER COLUMN "parentId" SET DATA TYPE TEXT USING "parentId"::text;
ALTER TABLE "news_articles" ALTER COLUMN "categoryId" SET DATA TYPE TEXT USING "categoryId"::text;
ALTER TABLE "roadmaps" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text, ALTER COLUMN "documentId" SET DATA TYPE TEXT USING "documentId"::text, ALTER COLUMN "categoryId" SET DATA TYPE TEXT USING "categoryId"::text;
ALTER TABLE "resources" ALTER COLUMN "roadmapId" SET DATA TYPE TEXT USING "roadmapId"::text;
ALTER TABLE "user_roadmap_progress" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text, ALTER COLUMN "roadmapId" SET DATA TYPE TEXT USING "roadmapId"::text;
ALTER TABLE "step_quiz_attempts" ALTER COLUMN "userId" SET DATA TYPE TEXT USING "userId"::text, ALTER COLUMN "roadmapId" SET DATA TYPE TEXT USING "roadmapId"::text;
ALTER TABLE "invitations" ALTER COLUMN "invitedById" SET DATA TYPE TEXT USING "invitedById"::text, ALTER COLUMN "acceptedById" SET DATA TYPE TEXT USING "acceptedById"::text;

-- Re-create FKs
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_summaries" ADD CONSTRAINT "document_summaries_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "resources" ADD CONSTRAINT "resources_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "user_roadmap_progress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "step_quiz_attempts" ADD CONSTRAINT "step_quiz_attempts_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
