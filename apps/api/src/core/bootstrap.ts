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
import { LocalDiskStorage } from '@/core/infra/storage/local-disk.storage';
import { SupabaseStorage } from '@/core/infra/storage/supabase.storage';
import { GCSStorage } from '@sagepoint/storage';
import { IFileStorage } from '@sagepoint/domain';
import * as path from 'path';

export interface AppDependencies {
  roadmap: RoadmapDependencies;
  document: DocumentDependencies;
  user: UserDependencies;
  storage: StorageDependencies;
  fileStorage: IFileStorage;
}

let dependencies: AppDependencies | null = null;

export function bootstrap(): AppDependencies {
  if (dependencies) {
    return dependencies;
  }

  // Initialize Infrastructure Adapters (Shared)
  let fileStorage: IFileStorage;
  const storageDriver = process.env.STORAGE_DRIVER || 'local';

  if (storageDriver === 'gcs') {
    fileStorage = new GCSStorage({
      projectId: process.env.GCP_PROJECT_ID!,
      bucketName: process.env.GCS_BUCKET_NAME!,
      keyFilename: process.env.GCP_KEY_FILE, // Optional - uses ADC if not provided
    });
  } else if (storageDriver === 'supabase') {
    fileStorage = new SupabaseStorage(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      process.env.SUPABASE_BUCKET_NAME || 'documents'
    );
  } else {
    // Default to local
    const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
    fileStorage = new LocalDiskStorage(uploadDir);
  }

  // User dependencies
  const userDeps = makeUserDependencies();

  // Initialize Neo4j
  const neo4jService = new Neo4jService({
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    pass: process.env.NEO4J_PASSWORD || 'password',
    encrypted: process.env.NEO4J_ENCRYPTION || 'ENCRYPTION_OFF'
  });

  dependencies = {
    roadmap: makeRoadmapDependencies(neo4jService),
    document: makeDocumentDependencies(fileStorage),
    user: userDeps,
    storage: makeStorageDependencies(fileStorage),
    fileStorage,
  };

  return dependencies;
}

export function getDependencies(): AppDependencies {
  if (!dependencies) {
    throw new Error('Dependencies not initialized. Call bootstrap() first.');
  }
  return dependencies;
}
