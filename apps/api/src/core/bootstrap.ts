import { Neo4jService } from '@sagepoint/graph';
import {
  makeRoadmapDependencies,
  type RoadmapDependencies,
} from '@/features/roadmap/dependencies';
import {
  makeDocumentDependencies,
  type DocumentDependencies,
} from '@/features/document/dependencies';
import {
  makeUserDependencies,
  type UserDependencies,
} from '@/features/user/dependencies';
import {
  makeStorageDependencies,
  type StorageDependencies,
} from '@/features/storage/dependencies';
import { GCSStorage } from '@sagepoint/storage';
import { IFileStorage } from '@sagepoint/domain';
import Redis from 'ioredis';
import { RedisCacheService } from '@/core/infra/cache/redis-cache.service';

export interface AppDependencies {
  roadmap: RoadmapDependencies;
  document: DocumentDependencies;
  user: UserDependencies;
  storage: StorageDependencies;
  fileStorage: IFileStorage;
  neo4jService: Neo4jService;
}

let dependencies: AppDependencies | null = null;

export function bootstrap(): AppDependencies {
  if (dependencies) {
    return dependencies;
  }

  const fileStorage: IFileStorage = new GCSStorage({
    projectId: process.env.GCP_PROJECT_ID!,
    bucketName: process.env.GCS_BUCKET_NAME!,
    keyFilename: process.env.GCP_KEY_FILE,
  });

  // User dependencies
  const userDeps = makeUserDependencies();

  // Initialize Neo4j
  const neo4jService = new Neo4jService({
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    pass: process.env.NEO4J_PASSWORD || 'password',
    encrypted: process.env.NEO4J_ENCRYPTION || 'ENCRYPTION_OFF',
  });

  // Cache service for progress repository
  const cacheRedis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    keyPrefix: 'cache:',
  });
  const cacheService = new RedisCacheService(cacheRedis);

  dependencies = {
    roadmap: makeRoadmapDependencies(neo4jService, cacheService),
    document: makeDocumentDependencies(fileStorage),
    user: userDeps,
    storage: makeStorageDependencies(fileStorage),
    fileStorage,
    neo4jService,
  };

  return dependencies;
}

export function getDependencies(): AppDependencies {
  if (!dependencies) {
    throw new Error('Dependencies not initialized. Call bootstrap() first.');
  }
  return dependencies;
}
