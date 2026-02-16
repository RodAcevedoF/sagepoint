import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ITopicConceptGenerationService,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  UserContext,
} from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiTopicConceptGeneratorConfig {
  apiKey: string;
}

@Injectable()
export class OpenAiTopicConceptGeneratorAdapter implements ITopicConceptGenerationService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiTopicConceptGeneratorAdapter.name);

  constructor(@Optional() @Inject(ConfigService) configOrService?: ConfigService | OpenAiTopicConceptGeneratorConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
    } else {
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

  private getExperienceLevelGuidelines(level?: string): string {
    switch (level) {
      case 'beginner':
        return `- Generate between 10 and 15 concepts.
- Focus on foundational, first-principles concepts.
- Start from the very basics — assume no prior knowledge.
- Include introductory and prerequisite concepts.`;
      case 'intermediate':
        return `- Generate between 8 and 12 concepts.
- Skip introductory/101 concepts — assume basic familiarity.
- Focus on practical application and common patterns.
- Include concepts that bridge theory and real-world usage.`;
      case 'advanced':
        return `- Generate between 8 and 12 concepts.
- Skip all basics — assume solid working knowledge.
- Focus on advanced patterns, architecture, and best practices.
- Include performance optimization and design trade-offs.`;
      case 'expert':
        return `- Generate between 6 and 10 specialized concepts.
- Target cutting-edge, research-level, or niche topics.
- Focus on deep specialization, edge cases, and advanced internals.
- Include emerging trends and expert-level techniques.`;
      default:
        return `- Generate between 8 and 15 concepts that cover the topic comprehensively.
- Start with foundational concepts and build up to advanced ones.`;
    }
  }

  async generateConceptsFromTopic(
    topic: string,
    userContext?: UserContext,
  ): Promise<{
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  }> {
    try {
      this.logger.log(`Generating concepts from topic: "${topic}"`);

      const topicConceptsSchema = z.object({
        concepts: z.array(
          z.object({
            id: z.string().describe('A unique identifier for this concept (use a short slug like "react-hooks")'),
            name: z.string().describe('The name of the concept'),
            description: z.string().nullable().describe('A brief description of what this concept covers'),
          })
        ).describe('The list of key concepts a learner needs to understand for this topic'),
        relationships: z.array(
          z.object({
            fromId: z.string().describe('The ID of the source concept'),
            toId: z.string().describe('The ID of the target concept'),
            type: z.enum(['DEPENDS_ON', 'RELATED_TO', 'NEXT_STEP']).describe('The type of relationship'),
          })
        ).describe('Relationships between concepts'),
      });

      const structuredModel = this.model.withStructuredOutput(topicConceptsSchema);

      const userContextInfo = userContext
        ? `
User Context:
- Goal: ${userContext.goal || 'General learning'}
- Experience Level: ${userContext.experienceLevel || 'Not specified'}
- Time Available: ${userContext.timeAvailable ? `${userContext.timeAvailable} hours/week` : 'Not specified'}
- Preferred Learning Style: ${userContext.preferredLearningStyle || 'Not specified'}`
        : '';

      const experienceGuidelines = this.getExperienceLevelGuidelines(
        userContext?.experienceLevel,
      );

      const result = await structuredModel.invoke([
        {
          role: 'system',
          content: `You are an expert curriculum designer. Given a learning topic, identify the key concepts a learner needs to understand, along with relationships between them.

Guidelines:
${experienceGuidelines}
- Each concept should have a unique short slug ID (e.g., "react-hooks", "state-management").
- Use DEPENDS_ON when one concept requires understanding of another first.
- Use NEXT_STEP for natural progression between concepts.
- Use RELATED_TO for concepts that are related but don't have a strict dependency.
- Consider the user's context if provided to tailor the concepts appropriately.`,
        },
        {
          role: 'user',
          content: `Identify key concepts and their relationships for learning about: "${topic}"
${userContextInfo}

Return a structured list of concepts with their relationships.`,
        },
      ]);

      this.logger.log(
        `Generated ${result.concepts.length} concepts with ${result.relationships.length} relationships for topic "${topic}"`,
      );

      return {
        concepts: result.concepts.map((c) => ({
          ...c,
          description: c.description ?? undefined,
        })),
        relationships: result.relationships,
      };
    } catch (error) {
      this.logger.error('Failed to generate concepts from topic', error);
      throw error;
    }
  }
}
