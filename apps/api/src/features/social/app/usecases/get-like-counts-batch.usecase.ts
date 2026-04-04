import type { ILikeRepository } from '@sagepoint/domain';

export class GetLikeCountsBatchUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(roadmapIds: string[]): Promise<Record<string, number>> {
    return this.likeRepository.getLikeCountsBatch(roadmapIds);
  }
}
