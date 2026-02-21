export class Quiz {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly title: string,
    public readonly questionCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description?: string,
  ) {}
}
