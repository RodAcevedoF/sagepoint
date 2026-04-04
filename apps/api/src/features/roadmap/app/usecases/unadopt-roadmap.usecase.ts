import type { IAdoptionRepository } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';

export class UnadoptRoadmapUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async execute(userId: string, roadmapId: string): Promise<void> {
    const isAdopted = await this.adoptionRepository.isAdopted(
      userId,
      roadmapId,
    );
    if (!isAdopted) {
      throw new NotFoundException('Roadmap is not in your library');
    }
    await this.adoptionRepository.unadopt(userId, roadmapId);
  }
}
