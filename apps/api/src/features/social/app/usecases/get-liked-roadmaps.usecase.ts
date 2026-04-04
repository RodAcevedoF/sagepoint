import type { ILikeRepository, Roadmap } from '@sagepoint/domain';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';

export class GetLikedRoadmapsUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly roadmapService: IRoadmapService,
  ) {}

  async execute(userId: string): Promise<Roadmap[]> {
    const roadmapIds = await this.likeRepository.getLikedRoadmapIds(userId);
    if (roadmapIds.length === 0) return [];

    const roadmaps = await Promise.all(
      roadmapIds.map((id) => this.roadmapService.findById(id)),
    );
    return roadmaps.filter((r): r is Roadmap => r !== null);
  }
}
