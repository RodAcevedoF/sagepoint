import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  IBlogPostGenerationService,
  BlogPostGenerationInput,
  BlogPostGenerationResult,
} from "@sagepoint/domain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { resolveOpenAiConfig, createChatModel } from "./llm-config";
import type { LlmAdapterConfig } from "./llm-config";

const blogPostSchema = z.object({
  title: z.string().describe("Compelling blog post title (max 80 characters)"),
  excerpt: z
    .string()
    .max(200)
    .describe("One-sentence summary of the post (max 200 characters)"),
  contentMarkdown: z
    .string()
    .describe(
      "Full blog post in markdown format, 600-800 words. Use ## for section headings. End with a ## Sources section listing source article titles.",
    ),
  suggestedSlug: z
    .string()
    .describe(
      "URL-friendly kebab-case slug derived from the title, e.g. understanding-react-hooks",
    ),
});

@Injectable()
export class OpenAiBlogPostGenerationAdapter implements IBlogPostGenerationService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiBlogPostGenerationAdapter.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    const resolved = resolveOpenAiConfig(
      configOrService,
      "MODEL_BLOG_POST_GENERATION",
    );
    this.model = createChatModel({
      ...resolved,
      modelName: resolved.modelName || "gpt-4o-mini",
      temperature: 0.7,
    });
  }

  async generate(
    input: BlogPostGenerationInput,
  ): Promise<BlogPostGenerationResult> {
    this.logger.log(
      `Generating blog post for category "${input.categoryName}" from ${input.sourceArticles.length} articles`,
    );

    const structuredModel = this.model.withStructuredOutput(blogPostSchema);

    const articleSummaries = input.sourceArticles
      .map(
        (a, i) =>
          `${i + 1}. "${a.title}" — ${a.source} (${a.publishedAt.toISOString().split("T")[0]})\n   ${a.description}`,
      )
      .join("\n\n");

    const result = await structuredModel.invoke([
      {
        role: "system",
        content: `You are a technical writer for Sagepoint, an AI-powered learning platform.
Write insightful blog posts that synthesize recent developments in technology and learning.

Guidelines:
- Synthesize the provided news articles into an original, coherent post — do not copy article text.
- Write for developers and learners interested in ${input.categoryName}.
- Use concrete examples and actionable insights.
- Maintain an educational but conversational tone.
- Structure with ## section headings for readability.
- End with a ## Sources section listing the article titles (not URLs).
- Target 600-800 words.`,
      },
      {
        role: "user",
        content: `Write a blog post about recent developments in ${input.categoryName} based on these articles:\n\n${articleSummaries}`,
      },
    ]);

    this.logger.log(`Blog post generated: "${result.title}"`);
    return result;
  }
}
