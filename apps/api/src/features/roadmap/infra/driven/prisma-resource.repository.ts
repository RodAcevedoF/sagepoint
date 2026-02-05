import { IResourceRepository, Resource, ResourceType } from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaResourceRepository implements IResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(resource: Resource): Promise<Resource> {
    const data = await this.prisma.resource.upsert({
      where: { id: resource.id },
      create: {
        id: resource.id,
        title: resource.title,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        provider: resource.provider,
        estimatedDuration: resource.estimatedDuration,
        difficulty: resource.difficulty,
        conceptId: resource.conceptId,
        order: resource.order,
        roadmapId: resource.roadmapId,
        createdAt: resource.createdAt,
      },
      update: {
        title: resource.title,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        provider: resource.provider,
        estimatedDuration: resource.estimatedDuration,
        difficulty: resource.difficulty,
        order: resource.order,
      },
    });
    return this.mapToDomain(data);
  }

  async saveMany(resources: Resource[]): Promise<Resource[]> {
    if (resources.length === 0) return [];

    // Use transaction for batch insert
    const results = await this.prisma.$transaction(
      resources.map((resource) =>
        this.prisma.resource.upsert({
          where: { id: resource.id },
          create: {
            id: resource.id,
            title: resource.title,
            url: resource.url,
            type: resource.type,
            description: resource.description,
            provider: resource.provider,
            estimatedDuration: resource.estimatedDuration,
            difficulty: resource.difficulty,
            conceptId: resource.conceptId,
            order: resource.order,
            roadmapId: resource.roadmapId,
            createdAt: resource.createdAt,
          },
          update: {
            title: resource.title,
            url: resource.url,
            type: resource.type,
            description: resource.description,
            provider: resource.provider,
            estimatedDuration: resource.estimatedDuration,
            difficulty: resource.difficulty,
            order: resource.order,
          },
        })
      )
    );

    return results.map(this.mapToDomain);
  }

  async findByRoadmapId(roadmapId: string): Promise<Resource[]> {
    const data = await this.prisma.resource.findMany({
      where: { roadmapId },
      orderBy: { order: 'asc' },
    });
    return data.map(this.mapToDomain);
  }

  async findByConceptId(conceptId: string): Promise<Resource[]> {
    const data = await this.prisma.resource.findMany({
      where: { conceptId },
      orderBy: { order: 'asc' },
    });
    return data.map(this.mapToDomain);
  }

  async deleteByRoadmapId(roadmapId: string): Promise<void> {
    await this.prisma.resource.deleteMany({
      where: { roadmapId },
    });
  }

  private mapToDomain(data: any): Resource {
    return new Resource({
      id: data.id,
      title: data.title,
      url: data.url,
      type: data.type as ResourceType,
      description: data.description || undefined,
      provider: data.provider || undefined,
      estimatedDuration: data.estimatedDuration || undefined,
      difficulty: data.difficulty || undefined,
      conceptId: data.conceptId,
      roadmapId: data.roadmapId,
      order: data.order,
      createdAt: data.createdAt,
    });
  }
}
