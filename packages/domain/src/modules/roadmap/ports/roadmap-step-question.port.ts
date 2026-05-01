import type {
  QuestionType,
  QuestionOption,
} from "../../document/entities/question.entity";

export const ROADMAP_STEP_QUESTION_REPOSITORY = Symbol(
  "ROADMAP_STEP_QUESTION_REPOSITORY",
);

export interface RoadmapStepQuestion {
  id: string;
  roadmapId: string;
  conceptId: string;
  stepOrder: number;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  explanation?: string;
  difficulty: string;
}

export interface IRoadmapStepQuestionRepository {
  saveMany(items: RoadmapStepQuestion[]): Promise<void>;
  findByRoadmapId(roadmapId: string): Promise<RoadmapStepQuestion[]>;
  deleteByRoadmapId(roadmapId: string): Promise<void>;
}
