import type {
  IDocumentRepository,
  IRoadmapRepository,
  IResourceLimitsRepository,
} from '@sagepoint/domain';
import { ResourceLimits } from '@sagepoint/domain';

export interface ResourceQuota {
  documents: { used: number; max: number | null; remaining: number | null };
  roadmaps: { used: number; max: number | null; remaining: number | null };
}

export class GetResourceQuotaUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly resourceLimitsRepository: IResourceLimitsRepository,
  ) {}

  async execute(userId: string): Promise<ResourceQuota> {
    const limits =
      (await this.resourceLimitsRepository.findByUserId(userId)) ??
      ResourceLimits.defaults(userId);

    const [docCount, roadmapCount] = await Promise.all([
      this.documentRepository.countByUserId(userId),
      this.roadmapRepository.countByUserId(userId),
    ]);

    return {
      documents: {
        used: docCount,
        max: limits.maxDocuments,
        remaining:
          limits.maxDocuments === null
            ? null
            : Math.max(0, limits.maxDocuments - docCount),
      },
      roadmaps: {
        used: roadmapCount,
        max: limits.maxRoadmaps,
        remaining:
          limits.maxRoadmaps === null
            ? null
            : Math.max(0, limits.maxRoadmaps - roadmapCount),
      },
    };
  }
}
