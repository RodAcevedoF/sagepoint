import { v4 as uuid } from 'uuid';
import type {
  IRoadmapRepository,
  IQuizGenerationService,
  IStepQuizAttemptRepository,
  IRoadmapStepQuestionRepository,
  RoadmapStep,
  RoadmapStepQuestion,
} from '@sagepoint/domain';
import { StepQuizAttempt, type StepQuizQuestion } from '@sagepoint/domain';

const QUESTIONS_PER_QUIZ = 3;

export interface GenerateStepQuizCommand {
  userId: string;
  roadmapId: string;
  conceptId: string;
}

export interface StepQuizQuestionForClient {
  index: number;
  text: string;
  type: string;
  options: { label: string; text: string }[];
  difficulty: string;
}

export interface GenerateStepQuizResult {
  attemptId: string;
  questions: StepQuizQuestionForClient[];
}

export class GenerateStepQuizUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly quizGenerationService: IQuizGenerationService,
    private readonly stepQuizAttemptRepository: IStepQuizAttemptRepository,
    private readonly roadmapStepQuestionRepository: IRoadmapStepQuestionRepository,
  ) {}

  async execute(
    command: GenerateStepQuizCommand,
  ): Promise<GenerateStepQuizResult> {
    const roadmap = await this.roadmapRepository.findById(command.roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${command.roadmapId} not found`);
    }
    if (roadmap.userId !== command.userId) {
      throw new Error('Not authorized to take a quiz on this roadmap');
    }

    const step = roadmap.steps.find((s) => s.concept.id === command.conceptId);
    if (!step) {
      throw new Error(
        `Concept ${command.conceptId} not found in roadmap ${command.roadmapId}`,
      );
    }

    const pending =
      await this.stepQuizAttemptRepository.findPendingByUserAndConcept(
        command.userId,
        command.roadmapId,
        command.conceptId,
      );

    if (pending) {
      return {
        attemptId: pending.id,
        questions: toClientQuestions(pending.questions),
      };
    }

    const questions = await this.loadOrGenerateQuestions(
      command.roadmapId,
      command.conceptId,
      step,
    );

    const attempt = new StepQuizAttempt({
      id: uuid(),
      userId: command.userId,
      roadmapId: command.roadmapId,
      conceptId: command.conceptId,
      questions,
      answers: null,
      score: 0,
      totalQuestions: questions.length,
      correctAnswers: 0,
      passed: false,
      createdAt: new Date(),
    });

    await this.stepQuizAttemptRepository.create(attempt);

    return {
      attemptId: attempt.id,
      questions: toClientQuestions(questions),
    };
  }

  private async loadOrGenerateQuestions(
    roadmapId: string,
    conceptId: string,
    step: RoadmapStep,
  ): Promise<StepQuizQuestion[]> {
    const canonical =
      await this.roadmapStepQuestionRepository.findByRoadmapAndConcept(
        roadmapId,
        conceptId,
      );

    if (canonical.length > 0) {
      return canonical.map(canonicalToDomain);
    }

    return this.generateAndPersist(roadmapId, conceptId, step);
  }

  private async generateAndPersist(
    roadmapId: string,
    conceptId: string,
    step: RoadmapStep,
  ): Promise<StepQuizQuestion[]> {
    const contextParts = [step.concept.name];
    if (step.concept.description) contextParts.push(step.concept.description);
    if (step.learningObjective)
      contextParts.push(`Learning objective: ${step.learningObjective}`);
    const contextText = contextParts.join('. ');

    const generated = await this.quizGenerationService.generateQuiz(
      contextText,
      [step.concept.name],
      {
        questionCount: QUESTIONS_PER_QUIZ,
        difficulty: step.difficulty ?? 'intermediate',
      },
    );

    const rows: RoadmapStepQuestion[] = generated.map((q, position) => ({
      id: uuid(),
      roadmapId,
      conceptId,
      stepOrder: step.order,
      position,
      text: q.text,
      type: q.type,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    await this.roadmapStepQuestionRepository.upsertMany(rows);

    // Re-read so concurrent generators converge on the first writer's ids;
    // the attempt then stores ids that match the canonical rows used by SR.
    const canonical =
      await this.roadmapStepQuestionRepository.findByRoadmapAndConcept(
        roadmapId,
        conceptId,
      );
    return canonical.map(canonicalToDomain);
  }
}

function canonicalToDomain(row: RoadmapStepQuestion): StepQuizQuestion {
  return {
    id: row.id,
    text: row.text,
    type: row.type,
    options: row.options,
    explanation: row.explanation,
    difficulty: row.difficulty,
  };
}

function toClientQuestions(
  questions: StepQuizQuestion[],
): StepQuizQuestionForClient[] {
  return questions.map((q, index) => ({
    index,
    text: q.text,
    type: q.type,
    options: q.options.map((o) => ({ label: o.label, text: o.text })),
    difficulty: q.difficulty,
  }));
}
