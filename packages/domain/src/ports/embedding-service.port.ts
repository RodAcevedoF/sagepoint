export interface IEmbeddingService {
  embed(texts: string[]): Promise<number[][]>;
  readonly dimensions: number;
}

export const EMBEDDING_SERVICE = Symbol("EMBEDDING_SERVICE");
