import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import type {
  ICategoryClassifierService,
  ClassifyCategoryInput,
} from "@sagepoint/domain";
import { resolveCerebrasConfig, createCerebrasModel } from "./llm-config";
import type { LlmAdapterConfig } from "./llm-config";

@Injectable()
export class CerebrasCategoryClassifierAdapter implements ICategoryClassifierService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(CerebrasCategoryClassifierAdapter.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    this.model = createCerebrasModel(resolveCerebrasConfig(configOrService));
  }

  async classify(input: ClassifyCategoryInput): Promise<string | null> {
    const { topic, conceptNames, candidates } = input;
    if (candidates.length === 0) return null;

    const prompt = this.buildPrompt(topic, conceptNames, candidates);
    try {
      const res = await this.model.invoke(prompt);
      const raw = String(res.content ?? "")
        .trim()
        .toLowerCase();
      const slug = raw.replace(/[^a-z0-9-]/g, "");
      if (!slug || slug === "none") return null;
      const match = candidates.find((c) => c.slug.toLowerCase() === slug);
      if (!match) {
        this.logger.warn({ raw, slug }, "Classifier returned unknown slug");
        return null;
      }
      return match.id;
    } catch (err) {
      this.logger.warn({ err }, "Cerebras classifier failed; returning null");
      return null;
    }
  }

  private buildPrompt(
    topic: string,
    conceptNames: string[],
    candidates: ClassifyCategoryInput["candidates"],
  ): string {
    const list = candidates
      .map(
        (c) =>
          `- ${c.slug}: ${c.name}${c.description ? ` — ${c.description}` : ""}`,
      )
      .join("\n");

    return [
      "You classify learning roadmaps into a single category.",
      "Respond with ONLY the category slug from the list below, or the word 'none' if no category clearly fits.",
      "Do not explain. Do not add quotes or punctuation. One word only.",
      "",
      `Topic: ${topic}`,
      `Concepts: ${conceptNames.slice(0, 15).join(", ")}`,
      "",
      "Categories:",
      list,
    ].join("\n");
  }
}
