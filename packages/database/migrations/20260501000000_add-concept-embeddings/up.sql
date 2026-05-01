CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "concept_embeddings" (
    "conceptId" UUID NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_embeddings_pkey" PRIMARY KEY ("conceptId")
);

CREATE INDEX "concept_embeddings_embedding_hnsw" ON "concept_embeddings" USING hnsw ("embedding" vector_cosine_ops);
