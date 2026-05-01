import type {
  IConceptEmbeddingRepository,
  ConceptEmbedding,
} from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaConceptEmbeddingRepository implements IConceptEmbeddingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMany(items: ConceptEmbedding[]): Promise<void> {
    if (items.length === 0) return;
    await this.prisma.$transaction(
      items.map(
        (item) =>
          this.prisma.$executeRaw`
          INSERT INTO "concept_embeddings" ("conceptId", "embedding")
          VALUES (${item.conceptId}, ${`[${item.embedding.join(",")}]`}::vector)
          ON CONFLICT ("conceptId") DO UPDATE SET "embedding" = EXCLUDED."embedding"
        `,
      ),
    );
  }
}
