-- Migration: 20260412000000_add-enriching-stage (rollback)
-- Note: PostgreSQL does not support removing enum values.
-- To rollback, update any rows with ENRICHING to SUMMARIZED first, then recreate the enum.

UPDATE "Document" SET "processingStage" = 'SUMMARIZED' WHERE "processingStage" = 'ENRICHING';

-- Recreate enum without ENRICHING:
-- ALTER TYPE "ProcessingStage" RENAME TO "ProcessingStage_old";
-- CREATE TYPE "ProcessingStage" AS ENUM ('UPLOADED', 'PARSING', 'ANALYZING', 'SUMMARIZED', 'READY');
-- ALTER TABLE "Document" ALTER COLUMN "processingStage" TYPE "ProcessingStage" USING "processingStage"::text::"ProcessingStage";
-- DROP TYPE "ProcessingStage_old";
