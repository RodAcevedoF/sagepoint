import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IResourceDiscoveryService,
  ResourceDiscoveryOptions,
  DiscoveredResource,
  ResourceType,
  ConceptForDiscovery,
} from "@sagepoint/domain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { resolvePerplexityConfig, createChatModel } from "./llm-config";

const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";

@Injectable()
export class PerplexityResearchAdapter implements IResourceDiscoveryService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(PerplexityResearchAdapter.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | { apiKey: string },
  ) {
    const resolved = resolvePerplexityConfig(configOrService);
    this.model = createChatModel({
      apiKey: resolved.apiKey,
      modelName: "sonar",
      temperature: 0.2,
      baseURL: PERPLEXITY_BASE_URL,
    });
  }

  async discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions,
  ): Promise<DiscoveredResource[]> {
    const maxResults = options?.maxResults ?? 5;

    try {
      this.logger.log(`Discovering resources for concept: "${conceptName}"`);

      const resourceSchema = z.object({
        resources: z.array(
          z.object({
            title: z.string().describe("The title of the learning resource"),
            url: z.string().url().describe("The URL to access the resource"),
            type: z
              .enum([
                "ARTICLE",
                "VIDEO",
                "COURSE",
                "DOCUMENTATION",
                "TUTORIAL",
                "BOOK",
              ])
              .describe("The type of resource"),
            description: z
              .string()
              .nullable()
              .describe("A brief description of what this resource covers"),
            provider: z
              .string()
              .nullable()
              .describe(
                "The platform or author providing this resource (e.g., YouTube, MDN, Udemy)",
              ),
            estimatedDuration: z
              .number()
              .nullable()
              .describe("Estimated time to complete in minutes"),
            difficulty: z
              .enum(["beginner", "intermediate", "advanced"])
              .nullable()
              .describe("The difficulty level of this resource"),
          }),
        ),
      });

      const structuredModel = this.model.withStructuredOutput(resourceSchema);

      const difficultyFilter = options?.difficulty
        ? `Focus on ${options.difficulty}-level resources.`
        : "";

      const typeFilter = options?.preferredTypes?.length
        ? `Prefer these resource types: ${options.preferredTypes.join(", ")}.`
        : "";

      const freeFilter = options?.freeOnly
        ? "Only include free resources."
        : "";

      const result = await structuredModel.invoke([
        {
          role: "system",
          content: `You are an expert learning resource curator. Find the best online learning resources for the given concept.

Guidelines:
1. Find real, currently available resources with valid URLs.
2. Prioritize high-quality, well-regarded sources (official docs, reputable platforms, established educators).
3. Include a mix of resource types when possible (articles, videos, tutorials).
4. Verify URLs are from legitimate learning platforms.
5. Prefer free resources unless paid ones are significantly better.
6. Include estimated duration when possible.
${difficultyFilter}
${typeFilter}
${freeFilter}`,
        },
        {
          role: "user",
          content: `Find ${maxResults} high-quality learning resources for the concept: "${conceptName}"
${conceptDescription ? `\nContext: ${conceptDescription}` : ""}

Return resources that would help someone learn and understand this concept effectively.`,
        },
      ]);

      this.logger.log(
        `Discovered ${result.resources.length} resources for "${conceptName}"`,
      );

      return result.resources.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type as ResourceType,
        description: r.description ?? undefined,
        provider: r.provider ?? undefined,
        estimatedDuration: r.estimatedDuration ?? undefined,
        difficulty: r.difficulty ?? undefined,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to discover resources for "${conceptName}"`,
        error,
      );
      return [];
    }
  }

  async discoverResourcesForConcepts(
    concepts: ConceptForDiscovery[],
    options?: ResourceDiscoveryOptions,
  ): Promise<Map<string, DiscoveredResource[]>> {
    const result = new Map<string, DiscoveredResource[]>();
    if (concepts.length === 0) return result;

    const maxPerConcept = options?.maxResults ?? 3;
    const batchSize = 4;

    for (let i = 0; i < concepts.length; i += batchSize) {
      const batch = concepts.slice(i, i + batchSize);

      try {
        this.logger.log(
          `Batch discovering resources for ${batch.length} concepts: ${batch.map((c) => c.name).join(", ")}`,
        );

        const batchResult = await this.invokeBatch(
          batch,
          maxPerConcept,
          options,
        );

        for (const group of batchResult) {
          const concept = batch.find(
            (c) =>
              c.id === group.conceptId ||
              c.name.toLowerCase() === group.conceptName.toLowerCase(),
          );
          if (concept) {
            result.set(
              concept.id,
              group.resources.map((r) => ({
                title: r.title,
                url: r.url,
                type: r.type as ResourceType,
                description: r.description ?? undefined,
                provider: r.provider ?? undefined,
                estimatedDuration: r.estimatedDuration ?? undefined,
                difficulty: r.difficulty ?? undefined,
              })),
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Batch discovery failed for concepts: ${batch.map((c) => c.name).join(", ")}`,
          error,
        );
        for (const concept of batch) {
          result.set(concept.id, []);
        }
      }
    }

    return result;
  }

  private async invokeBatch(
    concepts: ConceptForDiscovery[],
    maxPerConcept: number,
    options?: ResourceDiscoveryOptions,
  ) {
    const batchSchema = z.object({
      conceptResources: z.array(
        z.object({
          conceptId: z.string().describe("The ID of the concept"),
          conceptName: z.string().describe("The name of the concept"),
          resources: z.array(
            z.object({
              title: z.string().describe("The title of the learning resource"),
              url: z.string().url().describe("The URL to access the resource"),
              type: z
                .enum([
                  "ARTICLE",
                  "VIDEO",
                  "COURSE",
                  "DOCUMENTATION",
                  "TUTORIAL",
                  "BOOK",
                ])
                .describe("The type of resource"),
              description: z
                .string()
                .nullable()
                .describe("A brief description of what this resource covers"),
              provider: z
                .string()
                .nullable()
                .describe("The platform or author providing this resource"),
              estimatedDuration: z
                .number()
                .nullable()
                .describe("Estimated time to complete in minutes"),
              difficulty: z
                .enum(["beginner", "intermediate", "advanced"])
                .nullable()
                .describe("The difficulty level of this resource"),
            }),
          ),
        }),
      ),
    });

    const structuredModel = this.model.withStructuredOutput(batchSchema);

    const difficultyFilter = options?.difficulty
      ? `Focus on ${options.difficulty}-level resources.`
      : "";

    const conceptList = concepts
      .map(
        (c) =>
          `- ID: "${c.id}", Name: "${c.name}"${c.description ? `, Description: "${c.description}"` : ""}`,
      )
      .join("\n");

    const result = await structuredModel.invoke([
      {
        role: "system",
        content: `You are an expert learning resource curator. Find the best online learning resources for each of the given concepts.

Guidelines:
1. Find real, currently available resources with valid URLs.
2. Prioritize high-quality, well-regarded sources (official docs, reputable platforms, established educators).
3. Include a mix of resource types when possible (articles, videos, tutorials).
4. Prefer free resources unless paid ones are significantly better.
5. Return exactly ${maxPerConcept} resources per concept.
${difficultyFilter}`,
      },
      {
        role: "user",
        content: `Find ${maxPerConcept} high-quality learning resources for EACH of the following concepts:

${conceptList}

Return resources grouped by concept, using the exact concept IDs provided.`,
      },
    ]);

    return result.conceptResources;
  }
}
