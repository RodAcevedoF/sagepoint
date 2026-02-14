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
        ).describe('The list of key concepts a learner needs to understand for this topic (8-15 concepts)'),
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

      const result = await structuredModel.invoke([
        {
          role: 'system',
          content: `You are an expert curriculum designer. Given a learning topic, identify the key concepts a learner needs to understand, along with relationships between them.

Guidelines:
1. Generate between 8 and 15 concepts that cover the topic comprehensively.
2. Each concept should have a unique short slug ID (e.g., "react-hooks", "state-management").
3. Use DEPENDS_ON when one concept requires understanding of another first.
4. Use NEXT_STEP for natural progression between concepts.
5. Use RELATED_TO for concepts that are related but don't have a strict dependency.
6. Start with foundational concepts and build up to advanced ones.
7. Consider the user's context if provided to tailor the concepts appropriately.`,
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
