import type { IRoadmapRepository } from '@sagepoint/domain';

export class DeleteRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(id: string): Promise<void> {
    return this.roadmapRepository.delete(id);
  }
}
