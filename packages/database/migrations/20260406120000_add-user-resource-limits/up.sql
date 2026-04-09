-- Migration: 20260406120000_add-user-resource-limits
-- Author: raacevedo
-- Created: 2026-04-06T12:00:00.000Z

CREATE TABLE IF NOT EXISTS "user_resource_limits" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId"       UUID NOT NULL,
    "maxDocuments" INTEGER,
    "maxRoadmaps"  INTEGER,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_resource_limits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_resource_limits_userId_key" ON "user_resource_limits"("userId");

DO $$ BEGIN
  ALTER TABLE "user_resource_limits" ADD CONSTRAINT "user_resource_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
