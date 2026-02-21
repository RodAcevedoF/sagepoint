import {
  QuizAttempt,
  type IQuizAttemptRepository,
  type IQuestionRepository,
} from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface SubmitQuizAttemptCommand {
  quizId: string;
  userId: string;
  answers: Record<string, string>;
}

export class SubmitQuizAttemptUseCase {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(command: SubmitQuizAttemptCommand): Promise<QuizAttempt> {
    const questions = await this.questionRepository.findByQuizId(
      command.quizId,
    );
    if (questions.length === 0) {
      throw new NotFoundException(
        `No questions found for quiz ${command.quizId}`,
      );
    }

    let correctAnswers = 0;
    for (const question of questions) {
      const userAnswer = command.answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && userAnswer === correctOption.label) {
        correctAnswers++;
      }
    }

    const score =
      questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

    const attempt = new QuizAttempt(
      randomUUID(),
      command.quizId,
      command.userId,
      command.answers,
      score,
      questions.length,
      correctAnswers,
      new Date(),
      new Date(),
    );

    await this.attemptRepository.save(attempt);
    return attempt;
  }
}
