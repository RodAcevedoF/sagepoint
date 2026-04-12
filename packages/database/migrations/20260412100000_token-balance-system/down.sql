-- Recreate old table
CREATE TABLE IF NOT EXISTS "user_resource_limits" (
  "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId"       UUID NOT NULL,
  "maxDocuments" INTEGER,
  "maxRoadmaps"  INTEGER,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_resource_limits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_resource_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_resource_limits_userId_key" ON "user_resource_limits"("userId");

-- Drop new table
DROP TABLE IF EXISTS "user_token_balances";
