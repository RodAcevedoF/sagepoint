import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IContentAnalysisService, ExtractedConcept } from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiContentAnalysisConfig {
  apiKey: string;
  modelName?: string;
}

@Injectable()
export class OpenAiContentAnalysisAdapter implements IContentAnalysisService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiContentAnalysisAdapter.name);

  constructor(@Optional() @Inject(ConfigService) configOrService?: ConfigService | OpenAiContentAnalysisConfig) {
    let apiKey: string | undefined;
    let modelName: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
      modelName = configOrService.modelName;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
      modelName = configOrService.get<string>('MODEL_CONTENT_ANALYSIS');
    } else {
      apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. AI features will fail.');
    }

    this.model = new ChatOpenAI({
      apiKey,
      modelName: modelName || 'gpt-4o-mini',
      temperature: 0,
    });
  }

  async extractConcepts(text: string): Promise<ExtractedConcept[]> {
    if (!text || text.trim().length === 0) return [];

    try {
      this.logger.log(`Extracting concepts from text (${text.length} chars) using LangChain`);

      const conceptSchema = z.object({
        concepts: z.array(
          z.object({
            name: z.string().describe("The name of the concept (concise, singular)"),
            description: z.string().describe("A brief description of the concept"),
            relationships: z.array(z.object({
                targetName: z.string().describe("The name of the related concept (must match another concept's name EXACTLY)"),
                type: z.enum(['DEPENDS_ON', 'RELATED_TO', 'NEXT_STEP']).describe("The type of relationship"),
            })).default([]),
          })
        ),
      });

      const structuredModel = this.model.withStructuredOutput(conceptSchema);

      const result = await structuredModel.invoke([
        {
            role: "system",
            content: `You are an expert educational content analyzer. Extract key learning concepts from the provided text to build a knowledge graph.

            Guidelines:
            1. Identify core concepts, topics, or skills.
            2. Extract relationships between them:
               - DEPENDS_ON: If understanding Concept A requires Concept B (Concept A -> DEPENDS_ON -> Concept B).
               - NEXT_STEP: If Concept A logically leads to Concept B.
               - RELATED_TO: If concepts are merely related.
            3. Ensure names are consistent and normalized (title case).`
        },
        { role: "user", content: text }
      ]);

      return result.concepts.map(c => ({
        name: c.name,
        description: c.description,
        relationships: c.relationships || []
      }));

    } catch (error) {
      this.logger.error('Failed to extract concepts via LangChain', error);
      throw error;
    }
  }
}
