import type {
  IRoadmapRepository,
  ICategoryRepository,
  Roadmap,
  ICacheService,
} from '@sagepoint/domain';

export class UpdateCategoryUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly cache?: ICacheService,
  ) {}

  async execute(
    id: string,
    userId: string,
    categoryId: string | null,
  ): Promise<Roadmap> {
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.userId !== userId) {
      throw new Error('Not authorized to update this roadmap');
    }
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }
    const updated = await this.roadmapRepository.updateCategory(id, categoryId);
    await this.cache?.delByPattern('category-rooms:*');
    return updated;
  }
}
