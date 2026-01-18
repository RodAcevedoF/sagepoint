import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IContentAnalysisService, ExtractedConcept } from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

@Injectable()
export class OpenAiContentAnalysisAdapter implements IContentAnalysisService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiContentAnalysisAdapter.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. AI features will fail.');
    }
    
    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-3.5-turbo', 
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
            name: z.string().describe("The name of the concept"),
            description: z.string().describe("A brief description of the concept"),
          })
        ),
      });

      const structuredModel = this.model.withStructuredOutput(conceptSchema);

      const result = await structuredModel.invoke([
        {
            role: "system",
            content: "You are an expert educational content analyzer. Extract key concepts from the provided text."
        },
        { role: "user", content: text }
      ]);

      return result.concepts;
      
    } catch (error) {
      this.logger.error('Failed to extract concepts via LangChain', error);
      throw error; 
    }
  }
}
