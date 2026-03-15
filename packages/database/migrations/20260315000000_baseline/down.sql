-- Migration: 20260315000000_baseline
-- Author: racevedo
-- Created: 2026-03-15T00:00:00.000Z

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "step_quiz_attempts" CASCADE;
DROP TABLE IF EXISTS "user_roadmap_progress" CASCADE;
DROP TABLE IF EXISTS "resources" CASCADE;
DROP TABLE IF EXISTS "roadmaps" CASCADE;
DROP TABLE IF EXISTS "quiz_attempts" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "quizzes" CASCADE;
DROP TABLE IF EXISTS "document_summaries" CASCADE;
DROP TABLE IF EXISTS "documents" CASCADE;
DROP TABLE IF EXISTS "user_preferences" CASCADE;
DROP TABLE IF EXISTS "user_interests" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "QuestionType";
DROP TYPE IF EXISTS "RoadmapVisibility";
DROP TYPE IF EXISTS "ProcessingStage";
DROP TYPE IF EXISTS "StepStatus";
DROP TYPE IF EXISTS "RoadmapGenerationStatus";
DROP TYPE IF EXISTS "ResourceType";
DROP TYPE IF EXISTS "OnboardingStatus";
DROP TYPE IF EXISTS "UserRole";

-- Drop extensions
DROP EXTENSION IF EXISTS "vector";
