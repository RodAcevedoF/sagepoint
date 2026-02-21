import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IQuizGenerationService,
  GeneratedQuestion,
  QuizGenerationOptions,
  QuestionType,
} from '@sagepoint/domain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface OpenAiQuizGenerationConfig {
  apiKey: string;
}

@Injectable()
export class OpenAiQuizGenerationAdapter implements IQuizGenerationService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiQuizGenerationAdapter.name);

  constructor(@Optional() @Inject(ConfigService) configOrService?: ConfigService | OpenAiQuizGenerationConfig) {
    let apiKey: string | undefined;

    if (configOrService && 'apiKey' in configOrService) {
      apiKey = configOrService.apiKey;
    } else if (configOrService && 'get' in configOrService) {
      apiKey = configOrService.get<string>('OPENAI_API_KEY');
    } else {
      apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. Quiz generation will fail.');
    }

    this.model = new ChatOpenAI({
      apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });
  }

  async generateQuiz(
    text: string,
    conceptNames: string[],
    options?: QuizGenerationOptions,
  ): Promise<GeneratedQuestion[]> {
    const questionCount = options?.questionCount ?? 10;
    const difficulty = options?.difficulty ?? 'intermediate';

    this.logger.log(`Generating ${questionCount} quiz questions (difficulty: ${difficulty}) from ${conceptNames.length} concepts`);

    const quizSchema = z.object({
      questions: z.array(
        z.object({
          type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']).describe('Question type'),
          text: z.string().describe('The question text'),
          options: z.array(
            z.object({
              label: z.string().describe('Option label (A, B, C, D or True, False)'),
              text: z.string().describe('Option text'),
              isCorrect: z.boolean().describe('Whether this is the correct answer'),
            }),
          ).describe('Answer options'),
          explanation: z.string().describe('Brief explanation of the correct answer'),
          conceptName: z.string().nullable().describe('The concept this question tests, or null if not applicable'),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).describe('Question difficulty'),
        }),
      ),
    });

    const structuredModel = this.model.withStructuredOutput(quizSchema);

    const conceptList = conceptNames.length > 0
      ? `\nKey concepts to test: ${conceptNames.join(', ')}`
      : '';

    const result = await structuredModel.invoke([
      {
        role: 'system',
        content: `You are an expert quiz creator for educational content. Generate quiz questions based on the provided document text.

Guidelines:
- Generate exactly ${questionCount} questions.
- Mix question types: ~70% MULTIPLE_CHOICE and ~30% TRUE_FALSE.
- For MULTIPLE_CHOICE: provide 4 options (A, B, C, D) with exactly one correct answer.
- For TRUE_FALSE: provide 2 options (True, False) with exactly one correct answer.
- Target difficulty level: ${difficulty}.
- Each question should test understanding, not just memorization.
- Provide a brief explanation for each correct answer.
- If concept names are provided, link questions to relevant concepts.`,
      },
      {
        role: 'user',
        content: `Generate quiz questions from this document:

${text}${conceptList}`,
      },
    ]);

    this.logger.log(`Generated ${result.questions.length} quiz questions`);

    return result.questions.map((q) => ({
      type: q.type as QuestionType,
      text: q.text,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));
  }
}
