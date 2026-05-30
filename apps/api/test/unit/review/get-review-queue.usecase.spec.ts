import {
  Question,
  QuestionType,
  ReviewCard,
  ReviewSource,
  type RoadmapStepQuestion,
} from '@sagepoint/domain';
import { GetReviewQueueUseCase } from '../../../src/features/review/app/usecases/get-review-queue.usecase';
import {
  FakeReviewCardRepository,
  FakeQuestionRepository,
  FakeRoadmapStepQuestionRepository,
} from '../_fakes/repositories';

const USER_ID = 'user-1';
const NOW = new Date('2026-05-30T12:00:00.000Z');
const PAST = new Date('2026-05-30T10:00:00.000Z');
const FUTURE = new Date('2026-06-01T10:00:00.000Z');

function makeCard(props: {
  id: string;
  source: ReviewSource;
  sourceId: string;
  questionId: string;
  dueAt: Date;
}): ReviewCard {
  return new ReviewCard(
    props.id,
    USER_ID,
    props.source,
    props.sourceId,
    props.questionId,
    1,
    2.5,
    1,
    0,
    props.dueAt,
    PAST,
    PAST,
    PAST,
  );
}

const DOC_QUESTION = new Question(
  'doc-q-1',
  'quiz-1',
  QuestionType.MULTIPLE_CHOICE,
  'What is recursion?',
  [
    { label: 'A', text: 'A loop', isCorrect: false },
    { label: 'B', text: 'A function calling itself', isCorrect: true },
  ],
  0,
  'intermediate',
  PAST,
  'recursion explanation',
  'concept-x',
);

const STEP_QUESTION: RoadmapStepQuestion = {
  id: 'step-q-1',
  roadmapId: 'roadmap-1',
  conceptId: 'concept-1',
  stepOrder: 0,
  position: 0,
  text: 'What is a monad?',
  type: QuestionType.MULTIPLE_CHOICE,
  options: [
    { label: 'A', text: 'A burrito', isCorrect: false },
    { label: 'B', text: 'A monoid in endofunctors', isCorrect: true },
  ],
  explanation: 'monad explanation',
  difficulty: 'advanced',
};

describe('GetReviewQueueUseCase', () => {
  let cardRepo: FakeReviewCardRepository;
  let questionRepo: FakeQuestionRepository;
  let stepRepo: FakeRoadmapStepQuestionRepository;
  let useCase: GetReviewQueueUseCase;

  beforeEach(() => {
    cardRepo = new FakeReviewCardRepository();
    questionRepo = new FakeQuestionRepository();
    stepRepo = new FakeRoadmapStepQuestionRepository();
    useCase = new GetReviewQueueUseCase(cardRepo, questionRepo, stepRepo);
  });

  it('hydrates mixed-source cards with question content and strips isCorrect', async () => {
    cardRepo.seed(
      makeCard({
        id: 'card-doc',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-1',
        dueAt: PAST,
      }),
      makeCard({
        id: 'card-step',
        source: ReviewSource.ROADMAP_STEP,
        sourceId: 'concept-1',
        questionId: 'step-q-1',
        dueAt: PAST,
      }),
    );
    questionRepo.seed(DOC_QUESTION);
    stepRepo.seed(STEP_QUESTION);

    const items = await useCase.execute({ userId: USER_ID, now: NOW });

    expect(items).toHaveLength(2);
    const byCard = new Map(items.map((i) => [i.cardId, i]));

    const doc = byCard.get('card-doc')!;
    expect(doc.source).toBe(ReviewSource.DOCUMENT);
    expect(doc.question.text).toBe('What is recursion?');
    expect(doc.question.options).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((doc.question.options[0] as any).isCorrect).toBeUndefined();

    const step = byCard.get('card-step')!;
    expect(step.source).toBe(ReviewSource.ROADMAP_STEP);
    expect(step.question.text).toBe('What is a monad?');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((step.question.options[1] as any).isCorrect).toBeUndefined();
  });

  it('skips orphan cards whose question has been deleted', async () => {
    cardRepo.seed(
      makeCard({
        id: 'card-good',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-1',
        dueAt: PAST,
      }),
      makeCard({
        id: 'card-orphan',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-missing',
        dueAt: PAST,
      }),
    );
    questionRepo.seed(DOC_QUESTION);

    const items = await useCase.execute({ userId: USER_ID, now: NOW });

    expect(items).toHaveLength(1);
    expect(items[0].cardId).toBe('card-good');
  });

  it('filters by source + sourceId when provided', async () => {
    cardRepo.seed(
      makeCard({
        id: 'card-doc',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-1',
        dueAt: PAST,
      }),
      makeCard({
        id: 'card-step',
        source: ReviewSource.ROADMAP_STEP,
        sourceId: 'concept-1',
        questionId: 'step-q-1',
        dueAt: PAST,
      }),
    );
    questionRepo.seed(DOC_QUESTION);
    stepRepo.seed(STEP_QUESTION);

    const items = await useCase.execute({
      userId: USER_ID,
      source: ReviewSource.ROADMAP_STEP,
      sourceId: 'concept-1',
      now: NOW,
    });

    expect(items).toHaveLength(1);
    expect(items[0].cardId).toBe('card-step');
  });

  it('excludes cards that are not yet due', async () => {
    cardRepo.seed(
      makeCard({
        id: 'card-due',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-1',
        dueAt: PAST,
      }),
      makeCard({
        id: 'card-future',
        source: ReviewSource.DOCUMENT,
        sourceId: 'quiz-1',
        questionId: 'doc-q-1',
        dueAt: FUTURE,
      }),
    );
    questionRepo.seed(DOC_QUESTION);

    const items = await useCase.execute({ userId: USER_ID, now: NOW });

    expect(items.map((i) => i.cardId)).toEqual(['card-due']);
  });

  it('returns empty array and skips question lookups when no cards are due', async () => {
    const items = await useCase.execute({ userId: USER_ID, now: NOW });
    expect(items).toEqual([]);
  });
});
