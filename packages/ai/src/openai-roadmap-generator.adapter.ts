import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IRoadmapGenerationService,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  UserContext,
  GeneratedLearningPath,
} from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiRoadmapGeneratorConfig {
  apiKey: string;
}

@Injectable()
export class OpenAiRoadmapGeneratorAdapter implements IRoadmapGenerationService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiRoadmapGeneratorAdapter.name);

  constructor(configOrService?: ConfigService | OpenAiRoadmapGeneratorConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      // Direct config object
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      // NestJS ConfigService
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
    } else {
      // Fallback to env
      apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. AI features will fail.');
    }

    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });
  }

  async generateLearningPath(
    concepts: ConceptForOrdering[],
    relationships: ConceptRelationshipForOrdering[],
    userContext?: UserContext
  ): Promise<GeneratedLearningPath> {
    if (!concepts || concepts.length === 0) {
      return {
        orderedConcepts: [],
        description: 'No concepts available to create a learning path.',
      };
    }

    try {
      this.logger.log(
        `Generating learning path for ${concepts.length} concepts with ${relationships.length} relationships`
      );

      const learningPathSchema = z.object({
        orderedConcepts: z.array(
          z.object({
            conceptId: z.string().describe('The ID of the concept'),
            order: z.number().describe('The position in the learning sequence (1-based)'),
            learningObjective: z
              .string()
              .describe('What the learner will understand or be able to do after this step'),
            estimatedDuration: z
              .number()
              .optional()
              .describe('Estimated time to learn this concept in minutes'),
            difficulty: z
              .enum(['beginner', 'intermediate', 'advanced'])
              .describe('The difficulty level of this concept'),
            rationale: z
              .string()
              .describe('Brief explanation of why this concept is at this position'),
          })
        ),
        description: z
          .string()
          .describe('A brief description of the overall learning path and its goals'),
        totalEstimatedDuration: z
          .number()
          .optional()
          .describe('Total estimated time to complete the path in minutes'),
        recommendedPace: z
          .string()
          .optional()
          .describe('Suggested learning pace (e.g., "2-3 concepts per week")'),
      });

      const structuredModel = this.model.withStructuredOutput(learningPathSchema);

      const conceptsInfo = concepts
        .map((c) => `- ID: ${c.id}, Name: "${c.name}"${c.description ? `, Description: "${c.description}"` : ''}`)
        .join('\n');

      const relationshipsInfo =
        relationships.length > 0
          ? relationships
              .map((r) => {
                const fromConcept = concepts.find((c) => c.id === r.fromId)?.name || r.fromId;
                const toConcept = concepts.find((c) => c.id === r.toId)?.name || r.toId;
                return `- "${fromConcept}" ${r.type} "${toConcept}"`;
              })
              .join('\n')
          : 'No explicit relationships provided.';

      const userContextInfo = userContext
        ? `
User Context:
- Goal: ${userContext.goal || 'General learning'}
- Experience Level: ${userContext.experienceLevel || 'Not specified'}
- Time Available: ${userContext.timeAvailable ? `${userContext.timeAvailable} hours/week` : 'Not specified'}
- Preferred Learning Style: ${userContext.preferredLearningStyle || 'Not specified'}`
        : '';

      const result = await structuredModel.invoke([
        {
          role: 'system',
          content: `You are an expert educational curriculum designer. Your task is to organize a set of concepts into an optimal learning path.

Guidelines:
1. Order concepts from foundational to advanced, respecting dependencies.
2. If Concept A DEPENDS_ON Concept B, B must come before A.
3. NEXT_STEP relationships suggest a natural progression order.
4. RELATED_TO concepts can be grouped nearby but don't require strict ordering.
5. Provide clear learning objectives for each step.
6. Estimate realistic learning durations (typically 15-60 minutes per concept).
7. Assign appropriate difficulty levels based on prerequisites and complexity.
8. Consider the user's context if provided to personalize the path.`,
        },
        {
          role: 'user',
          content: `Please organize these concepts into an optimal learning path:

Concepts:
${conceptsInfo}

Relationships:
${relationshipsInfo}
${userContextInfo}

Return a structured learning path with each concept ordered, along with learning objectives and rationale.`,
        },
      ]);

      this.logger.log(`Generated learning path with ${result.orderedConcepts.length} ordered concepts`);

      return {
        orderedConcepts: result.orderedConcepts,
        description: result.description,
        totalEstimatedDuration: result.totalEstimatedDuration,
        recommendedPace: result.recommendedPace,
      };
    } catch (error) {
      this.logger.error('Failed to generate learning path via LangChain', error);
      throw error;
    }
  }
}
