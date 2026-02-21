export class QuizAttempt {
  constructor(
    public readonly id: string,
    public readonly quizId: string,
    public readonly userId: string,
    public readonly answers: Record<string, string>,
    public readonly score: number,
    public readonly totalQuestions: number,
    public readonly correctAnswers: number,
    public readonly createdAt: Date,
    public readonly completedAt?: Date,
  ) {}
}
