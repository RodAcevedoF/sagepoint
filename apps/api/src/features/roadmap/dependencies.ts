import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type { IRoadmapRepository } from '@sagepoint/domain';
import { RoadmapService } from '@/features/roadmap/infra/driver/roadmap.service';
import { InMemoryRoadmapRepository } from '@/features/roadmap/infra/driven/in-memory-roadmap.repository';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';

export interface RoadmapDependencies {
  roadmapService: IRoadmapService;
  roadmapRepository: IRoadmapRepository;
}

export function makeRoadmapDependencies(): RoadmapDependencies {
  const roadmapRepository = new InMemoryRoadmapRepository();

  const generateRoadmapUseCase = new GenerateRoadmapUseCase(roadmapRepository);
  const getRoadmapUseCase = new GetRoadmapUseCase(roadmapRepository);
  const deleteRoadmapUseCase = new DeleteRoadmapUseCase(roadmapRepository);

  const roadmapService = new RoadmapService(
    generateRoadmapUseCase,
    getRoadmapUseCase,
    deleteRoadmapUseCase,
  );

  return {
    roadmapService,
    roadmapRepository,
  };
}
