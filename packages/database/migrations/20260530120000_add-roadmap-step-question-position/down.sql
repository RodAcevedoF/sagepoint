DROP INDEX IF EXISTS "roadmap_step_questions_roadmapId_conceptId_position_key";

ALTER TABLE "roadmap_step_questions"
    DROP COLUMN "position";
