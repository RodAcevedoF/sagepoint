export const DEFAULT_MAX_DOCUMENTS = 5;
export const DEFAULT_MAX_ROADMAPS = 3;

export class ResourceLimits {
  constructor(
    public readonly userId: string,
    public readonly maxDocuments: number | null,
    public readonly maxRoadmaps: number | null,
  ) {}

  static defaults(userId: string): ResourceLimits {
    return new ResourceLimits(
      userId,
      DEFAULT_MAX_DOCUMENTS,
      DEFAULT_MAX_ROADMAPS,
    );
  }

  isDocumentAllowed(currentCount: number): boolean {
    return this.maxDocuments === null || currentCount < this.maxDocuments;
  }

  isRoadmapAllowed(currentCount: number): boolean {
    return this.maxRoadmaps === null || currentCount < this.maxRoadmaps;
  }
}
