export class DocumentSummary {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly overview: string,
    public readonly keyPoints: string[],
    public readonly topicArea: string,
    public readonly difficulty: string,
    public readonly conceptCount: number,
    public readonly createdAt: Date,
    public readonly estimatedReadTime?: number,
  ) {}
}
