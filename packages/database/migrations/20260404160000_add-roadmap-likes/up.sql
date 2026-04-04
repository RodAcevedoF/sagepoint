-- Migration: 20260404160000_add-roadmap-likes
-- Author: raacevedo
-- Created: 2026-04-04T16:00:00.000Z

-- CreateTable
CREATE TABLE IF NOT EXISTS "roadmap_likes" (
    "userId"    UUID NOT NULL,
    "roadmapId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_likes_pkey" PRIMARY KEY ("userId", "roadmapId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "roadmap_likes_roadmapId_idx" ON "roadmap_likes"("roadmapId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "roadmap_likes_userId_idx" ON "roadmap_likes"("userId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "roadmap_likes" ADD CONSTRAINT "roadmap_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "roadmap_likes" ADD CONSTRAINT "roadmap_likes_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
