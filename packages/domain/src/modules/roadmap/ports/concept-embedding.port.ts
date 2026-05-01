export interface ConceptEmbedding {
  conceptId: string;
  embedding: number[];
}

export interface IConceptEmbeddingRepository {
  saveMany(items: ConceptEmbedding[]): Promise<void>;
}

export const CONCEPT_EMBEDDING_REPOSITORY = Symbol(
  "CONCEPT_EMBEDDING_REPOSITORY",
);
