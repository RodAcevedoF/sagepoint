import { Roadmap } from '@sagepoint/domain';
import type { IRoadmapRepository } from '@sagepoint/domain';

export interface GenerateRoadmapCommand {
  documentId: string;
  title: string;
}

export class GenerateRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(command: GenerateRoadmapCommand): Promise<Roadmap> {
    // TODO: Integrate with LLM service to extract concepts from document
    // TODO: Build concept relationships based on LLM analysis
    // For now, create an empty roadmap as placeholder

    const roadmap = new Roadmap({
      id: crypto.randomUUID(),
      title: command.title,
      documentId: command.documentId,
      steps: [],
      createdAt: new Date(),
    });

    return this.roadmapRepository.save(roadmap);
  }
}
