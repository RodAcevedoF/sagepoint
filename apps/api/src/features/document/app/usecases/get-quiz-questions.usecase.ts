import type {
  Quiz,
  Question,
  IQuizRepository,
  IQuestionRepository,
} from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';

export interface QuizWithQuestions {
  quiz: Quiz;
  questions: Question[];
}

export class GetQuizQuestionsUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(quizId: string): Promise<QuizWithQuestions> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz ${quizId} not found`);
    }

    const questions = await this.questionRepository.findByQuizId(quizId);
    return { quiz, questions };
  }
}
