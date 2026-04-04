import type { IAdoptionRepository } from '@sagepoint/domain';

export class IsRoadmapAdoptedUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async execute(userId: string, roadmapId: string): Promise<boolean> {
    return this.adoptionRepository.isAdopted(userId, roadmapId);
  }
}
