import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { Roadmap } from '@sagepoint/domain';
import {
  GenerateRoadmapInput,
  IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

export class RoadmapService implements IRoadmapService {
  constructor(
    private readonly generateRoadmapUseCase: GenerateRoadmapUseCase,
    private readonly getRoadmapUseCase: GetRoadmapUseCase,
    private readonly deleteRoadmapUseCase: DeleteRoadmapUseCase,
  ) {}

  async generate(input: GenerateRoadmapInput): Promise<Roadmap> {
    return await this.generateRoadmapUseCase.execute(input);
  }

  async findById(id: string): Promise<Roadmap | null> {
    return await this.getRoadmapUseCase.execute(id);
  }

  async findByDocumentId(documentId: string): Promise<Roadmap[]> {
    return await this.getRoadmapUseCase.byDocumentId(documentId);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteRoadmapUseCase.execute(id);
  }
}
