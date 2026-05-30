ALTER TABLE "roadmap_step_questions"
    ADD COLUMN "position" INTEGER;

UPDATE "roadmap_step_questions" AS q
SET "position" = sub.rn - 1
FROM (
    SELECT "id",
           row_number() OVER (
               PARTITION BY "roadmapId", "conceptId"
               ORDER BY "createdAt", "id"
           ) AS rn
    FROM "roadmap_step_questions"
) AS sub
WHERE q."id" = sub."id";

ALTER TABLE "roadmap_step_questions"
    ALTER COLUMN "position" SET NOT NULL;

CREATE UNIQUE INDEX "roadmap_step_questions_roadmapId_conceptId_position_key"
    ON "roadmap_step_questions" ("roadmapId", "conceptId", "position");
