ALTER TABLE roadmaps
  DROP COLUMN IF EXISTS "resourcesStatus",
  DROP COLUMN IF EXISTS "resourcesErrorMessage";

DROP TYPE IF EXISTS "RoadmapResourcesStatus";
