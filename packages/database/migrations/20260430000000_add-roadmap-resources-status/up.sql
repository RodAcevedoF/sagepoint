CREATE TYPE "RoadmapResourcesStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

ALTER TABLE roadmaps
  ADD COLUMN IF NOT EXISTS "resourcesStatus"    "RoadmapResourcesStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "resourcesErrorMessage" TEXT;
