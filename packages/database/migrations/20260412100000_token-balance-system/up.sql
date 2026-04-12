-- Create token balance table
CREATE TABLE IF NOT EXISTS "user_token_balances" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId"     UUID NOT NULL,
  "balance"    INTEGER,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_token_balances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_token_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_token_balances_userId_key" ON "user_token_balances"("userId");

-- Migrate existing users: those with null limits (unlimited) stay null, others get 100 tokens
INSERT INTO "user_token_balances" ("userId", "balance")
SELECT
  u.id,
  CASE
    WHEN r."maxDocuments" IS NULL AND r."maxRoadmaps" IS NULL THEN NULL
    ELSE 100
  END
FROM "users" u
LEFT JOIN "user_resource_limits" r ON r."userId" = u.id
ON CONFLICT ("userId") DO NOTHING;

-- Drop old table
DROP TABLE IF EXISTS "user_resource_limits";
