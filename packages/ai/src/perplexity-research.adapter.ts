import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IResourceDiscoveryService,
  ResourceDiscoveryOptions,
  DiscoveredResource,
  ResourceType,
} from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface PerplexityResearchConfig {
  apiKey: string;
}

@Injectable()
export class PerplexityResearchAdapter implements IResourceDiscoveryService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(PerplexityResearchAdapter.name);

  constructor(configOrService?: ConfigService | PerplexityResearchConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('PERPLEXITY_API_KEY');
    } else {
      apiKey = process.env.PERPLEXITY_API_KEY;
    }

    if (!apiKey) {
      this.logger.warn('PERPLEXITY_API_KEY is not set. Resource discovery will fail.');
    }

    // Perplexity API is OpenAI-compatible
    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'sonar', // Perplexity's search-enabled model
      configuration: {
        baseURL: 'https://api.perplexity.ai',
      },
      temperature: 0.2,
    });
  }

  async discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions
  ): Promise<DiscoveredResource[]> {
    const maxResults = options?.maxResults ?? 5;

    try {
      this.logger.log(`Discovering resources for concept: "${conceptName}"`);

      const resourceSchema = z.object({
        resources: z.array(
          z.object({
            title: z.string().describe('The title of the learning resource'),
            url: z.string().url().describe('The URL to access the resource'),
            type: z
              .enum(['ARTICLE', 'VIDEO', 'COURSE', 'DOCUMENTATION', 'TUTORIAL', 'BOOK'])
              .describe('The type of resource'),
            description: z
              .string()
              .optional()
              .describe('A brief description of what this resource covers'),
            provider: z
              .string()
              .optional()
              .describe('The platform or author providing this resource (e.g., YouTube, MDN, Udemy)'),
            estimatedDuration: z
              .number()
              .optional()
              .describe('Estimated time to complete in minutes'),
            difficulty: z
              .enum(['beginner', 'intermediate', 'advanced'])
              .optional()
              .describe('The difficulty level of this resource'),
          })
        ),
      });

      const structuredModel = this.model.withStructuredOutput(resourceSchema);

      const difficultyFilter = options?.difficulty
        ? `Focus on ${options.difficulty}-level resources.`
        : '';

      const typeFilter = options?.preferredTypes?.length
        ? `Prefer these resource types: ${options.preferredTypes.join(', ')}.`
        : '';

      const freeFilter = options?.freeOnly ? 'Only include free resources.' : '';

      const result = await structuredModel.invoke([
        {
          role: 'system',
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
          role: 'user',
          content: `Find ${maxResults} high-quality learning resources for the concept: "${conceptName}"
${conceptDescription ? `\nContext: ${conceptDescription}` : ''}

Return resources that would help someone learn and understand this concept effectively.`,
        },
      ]);

      this.logger.log(`Discovered ${result.resources.length} resources for "${conceptName}"`);

      return result.resources.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type as ResourceType,
        description: r.description,
        provider: r.provider,
        estimatedDuration: r.estimatedDuration,
        difficulty: r.difficulty,
      }));
    } catch (error) {
      this.logger.error(`Failed to discover resources for "${conceptName}"`, error);
      // Return empty array on failure - don't block roadmap generation
      return [];
    }
  }
}
