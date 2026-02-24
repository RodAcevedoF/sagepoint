import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type {
  IRoadmapRepository,
  IRoadmapGenerationService,
  ITopicConceptGenerationService,
  IResourceDiscoveryService,
  IResourceRepository,
  IProgressRepository,
} from '@sagepoint/domain';
import { RoadmapService } from '@/features/roadmap/infra/driver/roadmap.service';
import { PrismaRoadmapRepository } from '@/features/roadmap/infra/driven/prisma-roadmap.repository';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
import { GenerateTopicRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-topic-roadmap.usecase';
import { EnqueueTopicRoadmapUseCase } from '@/features/roadmap/app/usecases/enqueue-topic-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';
import { UpdateStepProgressUseCase } from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import { RefreshResourcesUseCase } from '@/features/roadmap/app/usecases/refresh-resources.usecase';
import { GetUserRoadmapsUseCase } from '@/features/roadmap/app/usecases/get-user-roadmaps.usecase';
import { ExpandConceptUseCase } from '@/features/roadmap/app/usecases/expand-concept.usecase';
import { SuggestRelatedTopicsUseCase } from '@/features/roadmap/app/usecases/suggest-related-topics.usecase';
import { GenerateStepQuizUseCase } from '@/features/roadmap/app/usecases/generate-step-quiz.usecase';
import { SubmitStepQuizUseCase } from '@/features/roadmap/app/usecases/submit-step-quiz.usecase';
import { PrismaStepQuizAttemptRepository } from './infra/driven/prisma-step-quiz-attempt.repository';

import { Neo4jService } from '@sagepoint/graph';
import { Neo4jConceptRepository } from './infra/driven/neo4j-concept.repository';
import { GetGraphUseCase } from './app/usecases/get-graph.usecase';
import { createAiAdapters } from '@sagepoint/ai';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaResourceRepository } from './infra/driven/prisma-resource.repository';
import { PrismaProgressRepository } from './infra/driven/prisma-progress.repository';
import { BullMqRoadmapGenerationQueue } from '@/core/infra/queue/bull-mq-roadmap.queue';
import { Queue } from 'bullmq';

export interface RoadmapDependencies {
  roadmapService: IRoadmapService;
  roadmapRepository: IRoadmapRepository;
  roadmapGenerationService: IRoadmapGenerationService;
  topicConceptGenerationService: ITopicConceptGenerationService;
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

  // Create AI adapters via centralized factory
  const aiAdapters = createAiAdapters({
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    perplexityApiKey: process.env.PERPLEXITY_API_KEY || '',
  });
  const roadmapGenerationService = aiAdapters.roadmapGenerator;
  const topicConceptGenerationService = aiAdapters.topicConceptGenerator;
  const resourceDiscoveryService = aiAdapters.resourceDiscovery;

  // BullMQ queue for async roadmap generation
  const roadmapQueue = new Queue('roadmap-generation', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  const generationQueue = new BullMqRoadmapGenerationQueue(roadmapQueue);

  // Use cases
  const generateRoadmapUseCase = new GenerateRoadmapUseCase(
    roadmapRepository,
    conceptRepository,
    roadmapGenerationService,
    resourceDiscoveryService,
    resourceRepository,
  );
  const generateTopicRoadmapUseCase = new GenerateTopicRoadmapUseCase(
    roadmapRepository,
    topicConceptGenerationService,
    roadmapGenerationService,
    resourceDiscoveryService,
    resourceRepository,
  );
  const enqueueTopicRoadmapUseCase = new EnqueueTopicRoadmapUseCase(
    roadmapRepository,
    generationQueue,
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

  // Step quiz
  const stepQuizAttemptRepository = new PrismaStepQuizAttemptRepository(
    prismaService,
  );
  const generateStepQuizUseCase = new GenerateStepQuizUseCase(
    roadmapRepository,
    aiAdapters.quizGeneration,
    stepQuizAttemptRepository,
  );
  const submitStepQuizUseCase = new SubmitStepQuizUseCase(
    stepQuizAttemptRepository,
    updateStepProgressUseCase,
  );

  // Concept expansion & suggestions
  const expandConceptUseCase = new ExpandConceptUseCase(
    roadmapRepository,
    conceptRepository,
    aiAdapters.conceptExpansion,
    resourceDiscoveryService,
    resourceRepository,
  );
  const suggestRelatedTopicsUseCase = new SuggestRelatedTopicsUseCase(
    roadmapRepository,
    conceptRepository,
  );

  const roadmapService = new RoadmapService(
    generateRoadmapUseCase,
    generateTopicRoadmapUseCase,
    enqueueTopicRoadmapUseCase,
    getRoadmapUseCase,
    deleteRoadmapUseCase,
    getGraphUseCase,
    updateStepProgressUseCase,
    refreshResourcesUseCase,
    getUserRoadmapsUseCase,
    resourceRepository,
    expandConceptUseCase,
    suggestRelatedTopicsUseCase,
    generateStepQuizUseCase,
    submitStepQuizUseCase,
  );

  return {
    roadmapService,
    roadmapRepository,
    roadmapGenerationService,
    topicConceptGenerationService,
    resourceDiscoveryService,
    resourceRepository,
    progressRepository,
  };
}
