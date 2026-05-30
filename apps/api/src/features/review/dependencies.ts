import type { IReviewCardRepository } from '@sagepoint/domain';
import type { PrismaClient } from '@sagepoint/database';
import {
  PrismaReviewCardRepository,
  PrismaQuestionRepository,
  PrismaRoadmapStepQuestionRepository,
} from '@sagepoint/database';
import { ScheduleReviewUseCase } from './app/usecases/schedule-review.usecase';
import { GetDueCardsUseCase } from './app/usecases/get-due-cards.usecase';
import { GradeReviewUseCase } from './app/usecases/grade-review.usecase';
import { CountDueCardsUseCase } from './app/usecases/count-due-cards.usecase';
import { GetReviewQueueUseCase } from './app/usecases/get-review-queue.usecase';
import { ReviewService } from './infra/driver/review.service';
import type { IReviewService } from './domain/inbound/review.service';

export interface ReviewDependencies {
  reviewCardRepository: IReviewCardRepository;
  scheduleReviewUseCase: ScheduleReviewUseCase;
  getDueCardsUseCase: GetDueCardsUseCase;
  gradeReviewUseCase: GradeReviewUseCase;
  countDueCardsUseCase: CountDueCardsUseCase;
  getReviewQueueUseCase: GetReviewQueueUseCase;
  reviewService: IReviewService;
}

export function makeReviewDependencies(
  prismaService: PrismaClient,
): ReviewDependencies {
  const reviewCardRepository = new PrismaReviewCardRepository(prismaService);
  const questionRepository = new PrismaQuestionRepository(prismaService);
  const stepQuestionRepository = new PrismaRoadmapStepQuestionRepository(
    prismaService,
  );

  const scheduleReviewUseCase = new ScheduleReviewUseCase(reviewCardRepository);
  const getDueCardsUseCase = new GetDueCardsUseCase(reviewCardRepository);
  const gradeReviewUseCase = new GradeReviewUseCase(reviewCardRepository);
  const countDueCardsUseCase = new CountDueCardsUseCase(reviewCardRepository);
  const getReviewQueueUseCase = new GetReviewQueueUseCase(
    reviewCardRepository,
    questionRepository,
    stepQuestionRepository,
  );

  const reviewService = new ReviewService(
    getReviewQueueUseCase,
    countDueCardsUseCase,
    gradeReviewUseCase,
  );

  return {
    reviewCardRepository,
    scheduleReviewUseCase,
    getDueCardsUseCase,
    gradeReviewUseCase,
    countDueCardsUseCase,
    getReviewQueueUseCase,
    reviewService,
  };
}
