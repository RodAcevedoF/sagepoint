import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type {
  IRoadmapRepository,
  IRoadmapGenerationService,
  IResourceDiscoveryService,
  IResourceRepository,
  IProgressRepository,
} from '@sagepoint/domain';
import { RoadmapService } from '@/features/roadmap/infra/driver/roadmap.service';
import { PrismaRoadmapRepository } from '@/features/roadmap/infra/driven/prisma-roadmap.repository';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';
import { UpdateStepProgressUseCase } from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import { RefreshResourcesUseCase } from '@/features/roadmap/app/usecases/refresh-resources.usecase';
import { GetUserRoadmapsUseCase } from '@/features/roadmap/app/usecases/get-user-roadmaps.usecase';

import { Neo4jService } from '@sagepoint/graph';
import { Neo4jConceptRepository } from './infra/driven/neo4j-concept.repository';
import { GetGraphUseCase } from './app/usecases/get-graph.usecase';
import {
  OpenAiRoadmapGeneratorAdapter,
  PerplexityResearchAdapter,
} from '@sagepoint/ai';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaResourceRepository } from './infra/driven/prisma-resource.repository';
import { PrismaProgressRepository } from './infra/driven/prisma-progress.repository';

export interface RoadmapDependencies {
  roadmapService: IRoadmapService;
  roadmapRepository: IRoadmapRepository;
  roadmapGenerationService: IRoadmapGenerationService;
  resourceDiscoveryService: IResourceDiscoveryService;
  resourceRepository: IResourceRepository;
  progressRepository: IProgressRepository;
}

export function makeRoadmapDependencies(
  neo4jService: Neo4jService,
): RoadmapDependencies {
  const prismaService = new PrismaService();
  const roadmapRepository = new PrismaRoadmapRepository(prismaService);
  const conceptRepository = new Neo4jConceptRepository(neo4jService);
  const resourceRepository = new PrismaResourceRepository(prismaService);
  const progressRepository = new PrismaProgressRepository(prismaService);

  // Create AI adapters
  const roadmapGenerationService = new OpenAiRoadmapGeneratorAdapter({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  const resourceDiscoveryService = new PerplexityResearchAdapter({
    apiKey: process.env.PERPLEXITY_API_KEY || '',
  });

  // Use cases
  const generateRoadmapUseCase = new GenerateRoadmapUseCase(
    roadmapRepository,
    conceptRepository,
    roadmapGenerationService,
    resourceDiscoveryService,
    resourceRepository,
  );
  const getRoadmapUseCase = new GetRoadmapUseCase(roadmapRepository);
  const deleteRoadmapUseCase = new DeleteRoadmapUseCase(roadmapRepository);
  const getGraphUseCase = new GetGraphUseCase(conceptRepository);

  // Phase 3 use cases
  const updateStepProgressUseCase = new UpdateStepProgressUseCase(
    progressRepository,
    roadmapRepository,
  );
  const refreshResourcesUseCase = new RefreshResourcesUseCase(
    roadmapRepository,
    resourceRepository,
    resourceDiscoveryService,
  );
  const getUserRoadmapsUseCase = new GetUserRoadmapsUseCase(
    roadmapRepository,
    progressRepository,
    resourceRepository,
  );

  const roadmapService = new RoadmapService(
    generateRoadmapUseCase,
    getRoadmapUseCase,
    deleteRoadmapUseCase,
    getGraphUseCase,
    updateStepProgressUseCase,
    refreshResourcesUseCase,
    getUserRoadmapsUseCase,
    resourceRepository,
  );

  return {
    roadmapService,
    roadmapRepository,
    roadmapGenerationService,
    resourceDiscoveryService,
    resourceRepository,
    progressRepository,
  };
}
