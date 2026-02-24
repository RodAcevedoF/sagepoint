import type { StepQuizAttempt } from '../entities/step-quiz-attempt.entity';

export const STEP_QUIZ_ATTEMPT_REPOSITORY = Symbol('STEP_QUIZ_ATTEMPT_REPOSITORY');

export interface IStepQuizAttemptRepository {
  create(attempt: StepQuizAttempt): Promise<StepQuizAttempt>;
  findById(id: string): Promise<StepQuizAttempt | null>;
  update(attempt: StepQuizAttempt): Promise<StepQuizAttempt>;
}
