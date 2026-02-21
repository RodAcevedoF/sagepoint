import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDocumentAnalysisService, DocumentAnalysisResult } from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiDocumentAnalysisConfig {
  apiKey: string;
}

@Injectable()
export class OpenAiDocumentAnalysisAdapter implements IDocumentAnalysisService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiDocumentAnalysisAdapter.name);

  constructor(@Optional() @Inject(ConfigService) configOrService?: ConfigService | OpenAiDocumentAnalysisConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
    } else {
      apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. Document analysis will fail.');
    }

    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0,
    });
  }

  async analyzeDocument(text: string): Promise<DocumentAnalysisResult> {
    this.logger.log(`Analyzing document (${text.length} chars)`);

    const analysisSchema = z.object({
      overview: z.string().describe('A concise 2-4 sentence summary of the document content'),
      keyPoints: z.array(z.string()).describe('3-7 key takeaways or main points from the document'),
      topicArea: z.string().describe('The primary topic or subject area (e.g., "Machine Learning", "Web Development", "Biology")'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).describe('The difficulty level of the content'),
    });

    const structuredModel = this.model.withStructuredOutput(analysisSchema);

    const result = await structuredModel.invoke([
      {
        role: 'system',
        content: `You are an expert educational content analyst. Analyze the provided document text and produce a structured summary.

Guidelines:
- The overview should capture the essence of the document in 2-4 sentences.
- Key points should be actionable or informative takeaways (3-7 points).
- Topic area should be a concise label for the subject matter.
- Difficulty should reflect the assumed knowledge level needed to understand the content.`,
      },
      {
        role: 'user',
        content: text,
      },
    ]);

    this.logger.log(`Analysis complete: topic="${result.topicArea}", difficulty="${result.difficulty}", keyPoints=${result.keyPoints.length}`);

    return result;
  }
}
