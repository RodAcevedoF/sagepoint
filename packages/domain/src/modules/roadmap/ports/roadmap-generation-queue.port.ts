export const ROADMAP_GENERATION_QUEUE = Symbol('ROADMAP_GENERATION_QUEUE');

export interface IRoadmapGenerationQueue {
  add(
    roadmapId: string,
    topic: string,
    title: string,
    userId: string,
    userContext?: { experienceLevel?: string },
  ): Promise<void>;
}
