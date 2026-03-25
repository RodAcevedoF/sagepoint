import { NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export class ToggleRoadmapFeaturedUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(id: string): Promise<{ id: string; isFeatured: boolean }> {
    const roadmap = await this.adminRepository.findRoadmapById(id);
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    return this.adminRepository.updateRoadmapFeatured(id, !roadmap.isFeatured);
  }
}
