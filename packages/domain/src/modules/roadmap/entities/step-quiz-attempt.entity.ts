import type { QuestionOption, QuestionType } from '../../document/entities/question.entity';

export interface StepQuizQuestion {
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  explanation?: string;
  difficulty: string;
}

export interface StepQuizAttemptProps {
  id: string;
  userId: string;
  roadmapId: string;
  conceptId: string;
  questions: StepQuizQuestion[];
  answers?: Record<number, string> | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export class StepQuizAttempt {
  readonly id: string;
  readonly userId: string;
  readonly roadmapId: string;
  readonly conceptId: string;
  readonly questions: StepQuizQuestion[];
  readonly answers: Record<number, string> | null;
  readonly score: number;
  readonly totalQuestions: number;
  readonly correctAnswers: number;
  readonly passed: boolean;
  readonly completedAt?: Date;
  readonly createdAt: Date;

  constructor(props: StepQuizAttemptProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.roadmapId = props.roadmapId;
    this.conceptId = props.conceptId;
    this.questions = props.questions;
    this.answers = props.answers ?? null;
    this.score = props.score;
    this.totalQuestions = props.totalQuestions;
    this.correctAnswers = props.correctAnswers;
    this.passed = props.passed;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
  }
}
