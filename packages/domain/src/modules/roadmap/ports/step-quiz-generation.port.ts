import type { StepQuizQuestion } from "../entities/step-quiz-attempt.entity";

export const STEP_QUIZ_GENERATION_SERVICE = Symbol(
  "STEP_QUIZ_GENERATION_SERVICE",
);
export const STEP_QUIZ_ENRICHMENT_SERVICE = Symbol(
  "STEP_QUIZ_ENRICHMENT_SERVICE",
);

export interface StepQuizInput {
  conceptId: string;
  conceptName: string;
  conceptDescription?: string;
  learningObjective?: string;
  rationale?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  questionCount?: number;
  resourceSnippets?: string[];
}

export interface GeneratedStepQuiz {
  conceptId: string;
  questions: StepQuizQuestion[];
}

export interface IStepQuizGenerationService {
  generateForSteps(steps: StepQuizInput[]): Promise<GeneratedStepQuiz[]>;
}
