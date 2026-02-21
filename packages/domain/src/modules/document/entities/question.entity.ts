export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export class Question {
  constructor(
    public readonly id: string,
    public readonly quizId: string,
    public readonly type: QuestionType,
    public readonly text: string,
    public readonly options: QuestionOption[],
    public readonly order: number,
    public readonly difficulty: string,
    public readonly createdAt: Date,
    public readonly explanation?: string,
    public readonly conceptId?: string,
  ) {}
}
