CREATE TABLE "roadmap_step_questions" (
    "id"          UUID         NOT NULL,
    "roadmapId"   UUID         NOT NULL,
    "conceptId"   TEXT         NOT NULL,
    "stepOrder"   INTEGER      NOT NULL,
    "text"        TEXT         NOT NULL,
    "type"        TEXT         NOT NULL,
    "options"     JSONB        NOT NULL,
    "explanation" TEXT,
    "difficulty"  TEXT         NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_step_questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "roadmap_step_questions_roadmapId_fkey"
        FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE
);

CREATE INDEX "roadmap_step_questions_roadmapId_stepOrder_idx"
    ON "roadmap_step_questions" ("roadmapId", "stepOrder");

CREATE INDEX "roadmap_step_questions_roadmapId_conceptId_idx"
    ON "roadmap_step_questions" ("roadmapId", "conceptId");
