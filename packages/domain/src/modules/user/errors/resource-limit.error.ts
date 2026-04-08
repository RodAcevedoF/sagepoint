export class DocumentLimitExceededError extends Error {
  constructor(limit: number) {
    super(
      `Document limit of ${limit} reached. Delete a document or upgrade your plan.`,
    );
    this.name = "DocumentLimitExceededError";
  }
}

export class RoadmapLimitExceededError extends Error {
  constructor(limit: number) {
    super(
      `Roadmap limit of ${limit} reached. Delete a roadmap or upgrade your plan.`,
    );
    this.name = "RoadmapLimitExceededError";
  }
}
