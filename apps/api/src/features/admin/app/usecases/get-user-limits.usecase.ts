import type { IResourceLimitsRepository } from '@sagepoint/domain';
import { ResourceLimits } from '@sagepoint/domain';

export class GetUserLimitsUseCase {
  constructor(
    private readonly resourceLimitsRepository: IResourceLimitsRepository,
  ) {}

  async execute(userId: string): Promise<ResourceLimits> {
    return (
      (await this.resourceLimitsRepository.findByUserId(userId)) ??
      ResourceLimits.defaults(userId)
    );
  }
}
