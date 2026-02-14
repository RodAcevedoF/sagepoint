import {
  Roadmap,
  Concept,
  IRoadmapRepository,
  RoadmapStep,
  RoadmapGenerationStatus,
} from '@sagepoint/domain';
import type {
  Roadmap as PrismaRoadmap,
  RoadmapGenerationStatus as PrismaGenStatus,
} from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

interface SerializedStep {
  concept: {
    id: string;
    name: string;
    documentId?: string;
    description?: string;
  };
  order: number;
  dependsOn: string[];
  learningObjective?: string;
  estimatedDuration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rationale?: string;
}

export class PrismaRoadmapRepository implements IRoadmapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(roadmap: Roadmap): Promise<Roadmap> {
    const data = await this.prisma.roadmap.upsert({
      where: { id: roadmap.id },
      create: {
        id: roadmap.id,
        title: roadmap.title,
        documentId: roadmap.documentId || null,
        userId: roadmap.userId!,
        categoryId: roadmap.categoryId,
        description: roadmap.description,
        steps: this.serializeSteps(roadmap.steps),
        generationStatus: this.mapStatusToPrisma(roadmap.generationStatus),
        totalDuration: roadmap.totalEstimatedDuration,
        recommendedPace: roadmap.recommendedPace,
        createdAt: roadmap.createdAt,
      },
      update: {
        title: roadmap.title,
        description: roadmap.description,
        steps: this.serializeSteps(roadmap.steps),
        generationStatus: this.mapStatusToPrisma(roadmap.generationStatus),
        totalDuration: roadmap.totalEstimatedDuration,
        recommendedPace: roadmap.recommendedPace,
      },
    });
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<Roadmap | null> {
    const data = await this.prisma.roadmap.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  async findByDocumentId(documentId: string): Promise<Roadmap[]> {
    const data = await this.prisma.roadmap.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((r) => this.mapToDomain(r));
  }

  async findByUserId(userId: string): Promise<Roadmap[]> {
    const data = await this.prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((r) => this.mapToDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roadmap.delete({ where: { id } });
  }

  // Concept methods — delegated to Neo4j in practice, stubs here to satisfy interface
  saveConcept(concept: Concept): Promise<Concept> {
    return Promise.resolve(concept);
  }

  findConceptsByDocumentId(): Promise<Concept[]> {
    return Promise.resolve([]);
  }

  saveConceptRelation(): Promise<void> {
    return Promise.resolve();
  }

  private serializeSteps(steps: RoadmapStep[]): object[] {
    return steps.map((step) => ({
      concept: {
        id: step.concept.id,
        name: step.concept.name,
        documentId: step.concept.documentId,
        description: step.concept.description,
      },
      order: step.order,
      dependsOn: step.dependsOn,
      learningObjective: step.learningObjective,
      estimatedDuration: step.estimatedDuration,
      difficulty: step.difficulty,
      rationale: step.rationale,
    }));
  }

  private deserializeSteps(json: PrismaRoadmap['steps']): RoadmapStep[] {
    if (!Array.isArray(json)) return [];
    const steps = json as unknown as SerializedStep[];
    return steps.map((raw) => ({
      concept: new Concept(
        raw.concept.id,
        raw.concept.name,
        raw.concept.documentId,
        raw.concept.description,
      ),
      order: raw.order,
      dependsOn: raw.dependsOn || [],
      learningObjective: raw.learningObjective,
      estimatedDuration: raw.estimatedDuration,
      difficulty: raw.difficulty,
      rationale: raw.rationale,
    }));
  }

  private mapStatusToPrisma(status: RoadmapGenerationStatus): PrismaGenStatus {
    return status.toUpperCase() as PrismaGenStatus;
  }

  private mapStatusToDomain(status: PrismaGenStatus): RoadmapGenerationStatus {
    return status.toLowerCase() as RoadmapGenerationStatus;
  }

  private mapToDomain(data: PrismaRoadmap): Roadmap {
    return new Roadmap({
      id: data.id,
      title: data.title,
      documentId: data.documentId || undefined,
      userId: data.userId,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
      steps: this.deserializeSteps(data.steps),
      generationStatus: this.mapStatusToDomain(data.generationStatus),
      totalEstimatedDuration: data.totalDuration || undefined,
      recommendedPace: data.recommendedPace || undefined,
      createdAt: data.createdAt,
    });
  }
}
