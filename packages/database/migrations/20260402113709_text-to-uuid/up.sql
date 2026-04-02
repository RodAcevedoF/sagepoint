-- Migration: 20260402113709_text-to-uuid
-- Author: raacevedo
-- Created: 2026-04-02T11:37:09.702Z
--
-- Convert all ID and FK columns from TEXT to native UUID.
-- PostgreSQL can cast TEXT → UUID in-place when all values are valid UUIDs.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Step 1: Drop all foreign key constraints
-- ═══════════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════════
-- Step 2: Convert PK columns from TEXT → UUID
-- Must DROP DEFAULT first — the old default (gen_random_uuid()::text) can't
-- be auto-cast to UUID.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "users"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "user_preferences"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "documents"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "document_summaries"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "quizzes"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "questions"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "quiz_attempts"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "categories"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "news_articles"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "roadmaps"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "resources"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "step_quiz_attempts"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "invitations"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Step 3: Convert FK columns from TEXT → UUID
-- ═══════════════════════════════════════════════════════════════════════════════

-- user_interests
ALTER TABLE "user_interests"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid,
  ALTER COLUMN "categoryId" SET DATA TYPE UUID USING "categoryId"::uuid;

-- user_preferences
ALTER TABLE "user_preferences"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid;

-- documents
ALTER TABLE "documents"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid;

-- document_summaries
ALTER TABLE "document_summaries"
  ALTER COLUMN "documentId" SET DATA TYPE UUID USING "documentId"::uuid;

-- quizzes
ALTER TABLE "quizzes"
  ALTER COLUMN "documentId" SET DATA TYPE UUID USING "documentId"::uuid;

-- questions
ALTER TABLE "questions"
  ALTER COLUMN "quizId" SET DATA TYPE UUID USING "quizId"::uuid;

-- quiz_attempts
ALTER TABLE "quiz_attempts"
  ALTER COLUMN "quizId" SET DATA TYPE UUID USING "quizId"::uuid,
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid;

-- categories (self-ref)
ALTER TABLE "categories"
  ALTER COLUMN "parentId" SET DATA TYPE UUID USING "parentId"::uuid;

-- news_articles
ALTER TABLE "news_articles"
  ALTER COLUMN "categoryId" SET DATA TYPE UUID USING "categoryId"::uuid;

-- roadmaps
ALTER TABLE "roadmaps"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid,
  ALTER COLUMN "documentId" SET DATA TYPE UUID USING "documentId"::uuid,
  ALTER COLUMN "categoryId" SET DATA TYPE UUID USING "categoryId"::uuid;

-- resources
ALTER TABLE "resources"
  ALTER COLUMN "roadmapId" SET DATA TYPE UUID USING "roadmapId"::uuid;

-- user_roadmap_progress
ALTER TABLE "user_roadmap_progress"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid,
  ALTER COLUMN "roadmapId" SET DATA TYPE UUID USING "roadmapId"::uuid;

-- step_quiz_attempts
ALTER TABLE "step_quiz_attempts"
  ALTER COLUMN "userId" SET DATA TYPE UUID USING "userId"::uuid,
  ALTER COLUMN "roadmapId" SET DATA TYPE UUID USING "roadmapId"::uuid;

-- invitations
ALTER TABLE "invitations"
  ALTER COLUMN "invitedById" SET DATA TYPE UUID USING "invitedById"::uuid,
  ALTER COLUMN "acceptedById" SET DATA TYPE UUID USING "acceptedById"::uuid;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Step 4: Re-create all foreign key constraints
-- ═══════════════════════════════════════════════════════════════════════════════

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
