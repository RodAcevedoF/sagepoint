import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IConceptExpansionService,
  SubConceptResult,
  UserContext,
} from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiConceptExpansionConfig {
  apiKey: string;
}

@Injectable()
export class OpenAiConceptExpansionAdapter implements IConceptExpansionService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiConceptExpansionAdapter.name);

  constructor(@Optional() @Inject(ConfigService) configOrService?: ConfigService | OpenAiConceptExpansionConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
    } else {
      apiKey = process.env.OPENAI_API_KEY;
    }

    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });
  }

  async generateSubConcepts(
    parentName: string,
    parentDescription?: string,
    siblingConcepts?: string[],
    userContext?: UserContext,
  ): Promise<SubConceptResult[]> {
    try {
      this.logger.log(`Generating sub-concepts for: ${parentName}`);

      const subConceptSchema = z.object({
        subConcepts: z.array(
          z.object({
            name: z.string().describe('Name of the sub-concept'),
            description: z.string().describe('Brief description of the sub-concept'),
            order: z.number().describe('Order within the parent (1-based)'),
            estimatedDuration: z.number().nullable().describe('Estimated learning time in minutes'),
            difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
            learningObjective: z.string().describe('What the learner will understand after this sub-concept'),
          }),
        ),
      });

      const structuredModel = this.model.withStructuredOutput(subConceptSchema);

      const siblingsInfo = siblingConcepts?.length
        ? `\nOther concepts in the same roadmap: ${siblingConcepts.join(', ')}`
        : '';

      const userContextInfo = userContext
        ? `\nUser context: Experience level: ${userContext.experienceLevel || 'not specified'}, Goal: ${userContext.goal || 'general learning'}`
        : '';

      const result = await structuredModel.invoke([
        {
          role: 'system',
          content: `You are an expert educational content designer. Break down a concept into 3-5 learnable sub-concepts that progressively build understanding. Each sub-concept should be focused enough to learn in a single session.`,
        },
        {
          role: 'user',
          content: `Break down this concept into sub-concepts:

Concept: "${parentName}"${parentDescription ? `\nDescription: "${parentDescription}"` : ''}${siblingsInfo}${userContextInfo}

Generate 3-5 sub-concepts ordered from foundational to advanced.`,
        },
      ]);

      this.logger.log(`Generated ${result.subConcepts.length} sub-concepts for "${parentName}"`);

      return result.subConcepts.map((sc) => ({
        ...sc,
        estimatedDuration: sc.estimatedDuration ?? undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to generate sub-concepts for "${parentName}"`, error);
      throw error;
    }
  }
}
