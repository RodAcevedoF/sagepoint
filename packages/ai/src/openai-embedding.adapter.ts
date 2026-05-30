import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IEmbeddingService } from "@sagepoint/domain";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import type { LlmAdapterConfig } from "./llm-config";
import { resolveOpenAiConfig } from "./llm-config";
import { withRetry } from "./retry";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

@Injectable()
export class OpenAiEmbeddingAdapter implements IEmbeddingService {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAiEmbeddingAdapter.name);
  readonly dimensions = EMBEDDING_DIMENSIONS;

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    const resolved = resolveOpenAiConfig(configOrService, "OPENAI_API_KEY");
    this.client = new OpenAI({ apiKey: resolved.apiKey });
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const response = await withRetry(
      () =>
        traceable(
          () =>
            this.client.embeddings.create({
              model: EMBEDDING_MODEL,
              input: texts,
            }),
          { name: "openai.embeddings", run_type: "embedding" },
        )(),
      { opName: "openai.embeddings", logger: this.logger },
    );
    return response.data.map((d) => d.embedding);
  }
}
