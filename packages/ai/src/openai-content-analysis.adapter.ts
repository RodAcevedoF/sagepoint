import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IContentAnalysisService, ExtractedConcept } from '@sagepoint/domain';
import OpenAI from 'openai';

@Injectable()
export class OpenAiContentAnalysisAdapter implements IContentAnalysisService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAiContentAnalysisAdapter.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. AI features will fail.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async extractConcepts(text: string): Promise<ExtractedConcept[]> {
    if (!text || text.trim().length === 0) return [];

    try {
      this.logger.log(`Extracting concepts from text (${text.length} chars)`);
      
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert educational content analyzer. 
            Extract key concepts from the provided text.
            Return ONLY a JSON array of objects with 'name' and 'description' keys.
            Example: [{"name": "Photosynthesis", "description": "Process by which plants use sunlight..."}]`
          },
          { role: "user", content: text }
        ],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" }, 
        // Note: json_object requires 'JSON' in prompt, which I included. 
      });

      const content = completion.choices[0].message.content;
      if (!content) return [];

      const result = JSON.parse(content);
      
      if (Array.isArray(result)) return result;
      if (result.concepts && Array.isArray(result.concepts)) return result.concepts;
      
      // Fallback
      return Object.values(result).flat().filter((x: any) => x.name && x.description) as ExtractedConcept[];
      
    } catch (error) {
      this.logger.error('Failed to extract concepts via OpenAI', error);
      throw error; 
    }
  }
}
