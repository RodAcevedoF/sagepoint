export class Like {
  constructor(
    public readonly userId: string,
    public readonly roadmapId: string,
    public readonly createdAt: Date = new Date(),
  ) {}

  static create(userId: string, roadmapId: string): Like {
    return new Like(userId, roadmapId);
  }
}
