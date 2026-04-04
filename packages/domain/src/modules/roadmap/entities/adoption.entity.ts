export class UserAdoptedRoadmap {
  constructor(
    public readonly userId: string,
    public readonly roadmapId: string,
    public readonly adoptedAt: Date = new Date(),
  ) {}

  static create(userId: string, roadmapId: string): UserAdoptedRoadmap {
    return new UserAdoptedRoadmap(userId, roadmapId);
  }
}
