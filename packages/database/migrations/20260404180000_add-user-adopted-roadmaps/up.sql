-- Migration: 20260404180000_add-user-adopted-roadmaps
-- Author: raacevedo
-- Created: 2026-04-04T18:00:00.000Z

CREATE TABLE IF NOT EXISTS "user_adopted_roadmaps" (
    "userId"    UUID NOT NULL,
    "roadmapId" UUID NOT NULL,
    "adoptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_adopted_roadmaps_pkey" PRIMARY KEY ("userId", "roadmapId")
);

CREATE INDEX IF NOT EXISTS "user_adopted_roadmaps_userId_idx" ON "user_adopted_roadmaps"("userId");
CREATE INDEX IF NOT EXISTS "user_adopted_roadmaps_roadmapId_idx" ON "user_adopted_roadmaps"("roadmapId");

DO $$ BEGIN
  ALTER TABLE "user_adopted_roadmaps" ADD CONSTRAINT "user_adopted_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "user_adopted_roadmaps" ADD CONSTRAINT "user_adopted_roadmaps_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
