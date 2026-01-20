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
  makeAuthDependencies,
  type AuthDependencies,
  type AuthConfig,
} from '@/features/auth/dependencies';
import { LocalDiskStorage } from '@/core/infra/storage/local-disk.storage';
import { SupabaseStorage } from '@/core/infra/storage/supabase.storage';
import { IFileStorage } from '@sagepoint/domain';
import * as path from 'path';

export interface AppDependencies {
  roadmap: RoadmapDependencies;
  document: DocumentDependencies;
  user: UserDependencies;
  auth: AuthDependencies;
}

let dependencies: AppDependencies | null = null;

export function bootstrap(): AppDependencies {
  if (dependencies) {
    return dependencies;
  }

  // Initialize Infrastructure Adapters (Shared)
  let fileStorage: IFileStorage;
  const storageDriver = process.env.STORAGE_DRIVER || 'local';

  if (storageDriver === 'supabase') {
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

  // User dependencies (needed by auth)
  const userDeps = makeUserDependencies();

  // Auth configuration
  const authConfig: AuthConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    jwt: {
      accessSecret: process.env.JWT_SECRET || 'dev_secret',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    email: {
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || 'user',
      pass: process.env.SMTP_PASS || 'pass',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    useMockEmail: true, // Force mock email for debugging
  };

  console.log(`[Bootstrap] AuthConfig initialized. Access Secret: ${authConfig.jwt.accessSecret.substring(0, 3)}... (Length: ${authConfig.jwt.accessSecret.length})`);

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
    auth: makeAuthDependencies(authConfig, userDeps.userService),
  };

  return dependencies;
}

export function getDependencies(): AppDependencies {
  if (!dependencies) {
    throw new Error('Dependencies not initialized. Call bootstrap() first.');
  }
  return dependencies;
}
