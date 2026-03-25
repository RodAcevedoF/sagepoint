import { NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export class DeleteRoadmapUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const roadmap = await this.adminRepository.findRoadmapById(id);
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    await this.adminRepository.deleteRoadmap(id);
    return { success: true };
  }
}
