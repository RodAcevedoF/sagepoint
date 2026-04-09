import { NotFoundException } from '@nestjs/common';
import type { IResourceLimitsRepository } from '@sagepoint/domain';
import { ResourceLimits } from '@sagepoint/domain';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export interface UpdateUserLimitsCommand {
  userId: string;
  maxDocuments?: number | null;
  maxRoadmaps?: number | null;
}

export class UpdateUserLimitsUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly resourceLimitsRepository: IResourceLimitsRepository,
  ) {}

  async execute(command: UpdateUserLimitsCommand): Promise<ResourceLimits> {
    const user = await this.adminRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User not found');

    const existing =
      (await this.resourceLimitsRepository.findByUserId(command.userId)) ??
      ResourceLimits.defaults(command.userId);

    const limits = new ResourceLimits(
      command.userId,
      command.maxDocuments !== undefined
        ? command.maxDocuments
        : existing.maxDocuments,
      command.maxRoadmaps !== undefined
        ? command.maxRoadmaps
        : existing.maxRoadmaps,
    );

    await this.resourceLimitsRepository.save(limits);
    return limits;
  }
}
