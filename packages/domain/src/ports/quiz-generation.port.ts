import type { QuestionType, QuestionOption } from '../modules/document/entities/question.entity';

export interface GeneratedQuestion {
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  explanation?: string;
  conceptId?: string;
  difficulty: string;
}

export interface QuizGenerationOptions {
  questionCount?: number;
  difficulty?: string;
  questionTypes?: QuestionType[];
}

export const QUIZ_GENERATION_SERVICE = Symbol('QUIZ_GENERATION_SERVICE');

export interface IQuizGenerationService {
  generateQuiz(
    text: string,
    conceptNames: string[],
    options?: QuizGenerationOptions,
  ): Promise<GeneratedQuestion[]>;
}
