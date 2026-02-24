import { v4 as uuid } from 'uuid';
import type {
  IRoadmapRepository,
  IQuizGenerationService,
  IStepQuizAttemptRepository,
} from '@sagepoint/domain';
import { StepQuizAttempt, type StepQuizQuestion } from '@sagepoint/domain';

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
  ) {}

  async execute(
    command: GenerateStepQuizCommand,
  ): Promise<GenerateStepQuizResult> {
    const roadmap = await this.roadmapRepository.findById(command.roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${command.roadmapId} not found`);
    }

    const step = roadmap.steps.find((s) => s.concept.id === command.conceptId);
    if (!step) {
      throw new Error(
        `Concept ${command.conceptId} not found in roadmap ${command.roadmapId}`,
      );
    }

    // Build context text for quiz generation
    const contextParts = [step.concept.name];
    if (step.concept.description) contextParts.push(step.concept.description);
    if (step.learningObjective)
      contextParts.push(`Learning objective: ${step.learningObjective}`);
    const contextText = contextParts.join('. ');

    // Generate quiz questions via AI
    const generatedQuestions = await this.quizGenerationService.generateQuiz(
      contextText,
      [step.concept.name],
      { questionCount: 3, difficulty: step.difficulty ?? 'intermediate' },
    );

    // Map to our domain type
    const questions: StepQuizQuestion[] = generatedQuestions.map((q) => ({
      text: q.text,
      type: q.type,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    // Persist attempt with full questions (including isCorrect)
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

    // Return questions stripped of isCorrect
    const clientQuestions: StepQuizQuestionForClient[] = questions.map(
      (q, i) => ({
        index: i,
        text: q.text,
        type: q.type,
        options: q.options.map((o) => ({ label: o.label, text: o.text })),
        difficulty: q.difficulty,
      }),
    );

    return { attemptId: attempt.id, questions: clientQuestions };
  }
}
