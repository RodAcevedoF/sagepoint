export const ADOPTION_REPOSITORY = Symbol("ADOPTION_REPOSITORY");

export interface IAdoptionRepository {
  adopt(userId: string, roadmapId: string): Promise<void>;
  unadopt(userId: string, roadmapId: string): Promise<void>;
  isAdopted(userId: string, roadmapId: string): Promise<boolean>;
  findAdoptedRoadmapIds(userId: string): Promise<string[]>;
}
