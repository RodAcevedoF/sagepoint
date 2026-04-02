/**
 * E2E test app factory.
 *
 * Builds a real NestJS application with fake infrastructure:
 * - Overrides the bootstrap() singleton with in-memory fakes
 * - Replaces Redis, Prisma, Neo4j, GCS with test doubles
 * - Keeps real controllers, pipes, guards, filters — tests the full HTTP layer
 */
import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { EventEmitter } from 'events';

import { AppModule } from '@/app.module';
import { RedisCacheService } from '@/core/infra/cache/redis-cache.service';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import { PASSWORD_HASHER } from '@/features/auth/domain/outbound/password-hasher.port';
import { EMAIL_SERVICE_PORT } from '@/features/auth/domain/outbound/email.service.port';
import {
  CATEGORY_REPOSITORY,
  INVITATION_REPOSITORY,
  NEWS_SERVICE,
  USER_REPOSITORY,
  ROADMAP_REPOSITORY,
} from '@sagepoint/domain';
import { CATEGORY_SERVICE } from '@/features/category/domain/inbound/category.service';

import {
  FakeUserRepository,
  FakeCategoryRepository,
  FakeDocumentRepository,
  FakeRoadmapRepository,
  FakeProgressRepository,
  FakeResourceRepository,
  FakeQuestionRepository,
  FakeQuizAttemptRepository,
  FakeQuizRepository,
  FakeDocumentSummaryRepository,
  FakeConceptRepository,
  FakeFileStorage,
  FakeProcessingQueue,
  FakeCacheService,
  FakeTokenStore,
  FakePasswordHasher,
  FakeEmailService,
  FakeUserService,
  FakeInvitationRepository,
} from '../../unit/_fakes/repositories';

import type { IDocumentService } from '@/features/document/domain/inbound/document.service';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type { IStorageService } from '@/features/storage/domain/inbound/storage.service';
import type { UpdateStepProgressResult } from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import type { RefreshResourcesResult } from '@/features/roadmap/app/usecases/refresh-resources.usecase';
import type { SubmitStepQuizResult } from '@/features/roadmap/app/usecases/submit-step-quiz.usecase';

// Fake services that implement full interfaces

class FakeDocumentService implements Partial<IDocumentService> {
  private docs = new FakeDocumentRepository();
  private summaries = new FakeDocumentSummaryRepository();
  private quizzes = new FakeQuizRepository();
  private questions = new FakeQuestionRepository();
  private attempts = new FakeQuizAttemptRepository();
  private storage = new FakeFileStorage();
  private queue = new FakeProcessingQueue();

  async upload(input: {
    filename: string;
    mimeType: string;
    size: number;
    fileBuffer: Buffer;
    userId: string;
  }) {
    const { Document, DocumentStatus, ProcessingStage } =
      await import('@sagepoint/domain');
    const id = (await import('crypto')).randomUUID();
    const doc = new Document(
      id,
      input.filename,
      `documents/${id}/${input.filename}`,
      DocumentStatus.PROCESSING,
      input.userId,
      new Date(),
      new Date(),
      undefined,
      0,
      ProcessingStage.UPLOADED,
      input.mimeType,
      input.size,
    );
    await this.docs.save(doc);
    await this.storage.upload(doc.storagePath, input.fileBuffer);
    await this.queue.add(id, doc.storagePath, input.filename, input.mimeType);
    return doc;
  }

  async get(id: string) {
    return this.docs.findById(id);
  }
  async list() {
    return this.docs.findAll();
  }
  async getUserDocuments(userId: string) {
    return this.docs.findByUserId(userId);
  }
  async getUserDocumentsCursor(
    userId: string,
    params: { limit: number; cursor?: string },
  ) {
    return this.docs.findByUserIdCursor(userId, params);
  }
  async delete(id: string) {
    await this.docs.delete(id);
  }
  async getSummary(documentId: string) {
    return this.summaries.findByDocumentId(documentId);
  }
  async getQuizzes(documentId: string) {
    return this.quizzes.findByDocumentId(documentId);
  }
  async getQuizWithQuestions(quizId: string) {
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) throw new Error(`Quiz ${quizId} not found`);
    const questions = await this.questions.findByQuizId(quizId);
    return { quiz, questions };
  }
  async submitQuizAttempt(input: {
    quizId: string;
    userId: string;
    answers: Record<string, string>;
  }) {
    const { QuizAttempt } = await import('@sagepoint/domain');
    const id = (await import('crypto')).randomUUID();
    const attempt = new QuizAttempt(
      id,
      input.quizId,
      input.userId,
      input.answers,
      0,
      0,
      0,
      new Date(),
    );
    await this.attempts.save(attempt);
    return attempt;
  }
  async getQuizAttempts(userId: string, quizId: string) {
    return this.attempts.findByUserAndQuiz(userId, quizId);
  }
}

class FakeRoadmapService implements Partial<IRoadmapService> {
  private roadmaps = new FakeRoadmapRepository();
  private resources = new FakeResourceRepository();
  private progress = new FakeProgressRepository();
  private concepts = new FakeConceptRepository();

  async generate() {
    const { Roadmap } = await import('@sagepoint/domain');
    return new Roadmap({
      id: (await import('crypto')).randomUUID(),
      title: 'Test Roadmap',
      userId: 'u1',
      steps: [],
      createdAt: new Date(),
    });
  }
  async generateFromTopic() {
    return this.generate();
  }
  async findById(id: string) {
    return this.roadmaps.findById(id);
  }
  async findByDocumentId(documentId: string) {
    return this.roadmaps.findByDocumentId(documentId);
  }
  async delete(id: string) {
    await this.roadmaps.delete(id);
  }
  getGraph() {
    return Promise.resolve({ nodes: [], edges: [] });
  }
  updateStepProgress(): Promise<UpdateStepProgressResult> {
    return Promise.resolve(null as unknown as UpdateStepProgressResult);
  }
  getUserRoadmaps() {
    return Promise.resolve([]);
  }
  getUserRoadmapById() {
    return Promise.resolve(null);
  }
  refreshResources(): Promise<RefreshResourcesResult> {
    return Promise.resolve({
      roadmapId: '',
      resourcesRefreshed: 0,
      conceptsProcessed: 0,
    });
  }
  async getResourcesByRoadmap(roadmapId: string) {
    return this.resources.findByRoadmapId(roadmapId);
  }
  async expandConcept() {
    return this.generate();
  }
  getSuggestions() {
    return Promise.resolve([]);
  }
  async updateVisibility() {
    return this.generate();
  }
  async getPublicRoadmaps() {
    return this.roadmaps.findPublic();
  }
  generateStepQuiz() {
    return Promise.resolve({ attemptId: 'a1', questions: [] });
  }
  submitStepQuiz(): Promise<SubmitStepQuizResult> {
    return Promise.resolve({
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      passed: false,
      results: [],
    });
  }
}

class FakeStorageService implements Partial<IStorageService> {
  private storage = new FakeFileStorage();

  async upload(input: { content: Buffer; filename: string }) {
    const path = `uploads/${input.filename}`;
    await this.storage.upload(path, input.content);
    return { path, url: `https://storage.example.com/${path}` };
  }
  getUrl(path: string) {
    return Promise.resolve(`https://storage.example.com/${path}`);
  }
  async delete(path: string) {
    await this.storage.delete(path);
  }
}

// ─── Fake NewsService ─────────────────────────────────────────────────────────

class FakeNewsService {
  fetchByCategory() {
    return Promise.resolve([]);
  }
}

// ─── Stub QueueEvents (replaces BullMQ's QueueEvents) ────────────────────────

class StubQueueEvents extends EventEmitter {
  constructor() {
    super();
  }
  async close() {
    /* noop */
  }
}

// Stub PrismaService (for AdminModule which uses it directly)

class StubPrismaService {
  user = {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    update: () => Promise.resolve({}),
  };
  document = {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    delete: () => Promise.resolve({}),
    groupBy: () => Promise.resolve([]),
  };
  roadmap = {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    delete: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  };
  quiz = { count: () => Promise.resolve(0) };
  invitation = {
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    upsert: () => Promise.resolve({}),
  };
  $queryRaw = () => Promise.resolve([]);
  $connect = async () => {};
  $disconnect = async () => {};
  onModuleInit = async () => {};
  onModuleDestroy = async () => {};
}

// ─── Stub BullMQ Queue (for AdminModule) ─────────────────────────────────────

class StubQueue {
  name = 'stub';
  getJobCounts() {
    return Promise.resolve({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    });
  }
  getFailed() {
    return Promise.resolve([]);
  }
}

// Boot

export interface TestContext {
  app: INestApplication;
  fakes: {
    tokenStore: FakeTokenStore;
    passwordHasher: FakePasswordHasher;
    emailService: FakeEmailService;
    cache: FakeCacheService;
    userService: FakeUserService;
  };
}

/**
 * Override the bootstrap singleton BEFORE NestJS resolves modules.
 * The feature modules call getDependencies() inside useFactory — by
 * patching the module-level `dependencies` variable we ensure they
 * get fakes.
 */
function patchBootstrapSingleton() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bootstrapModule = require('@/core/bootstrap') as Record<
    string,
    (...args: unknown[]) => unknown
  >;

  const fakeFileStorage = new FakeFileStorage();
  const fakeUserRepo = new FakeUserRepository();
  const fakeDocumentService = new FakeDocumentService();
  const fakeRoadmapService = new FakeRoadmapService();
  const fakeUserService = new FakeUserService();
  const fakeStorageService = new FakeStorageService();

  // Patch the module exports so getDependencies() returns fakes
  const fakeDeps = {
    document: {
      documentService: fakeDocumentService,
      documentRepository: new FakeDocumentRepository(),
    },
    roadmap: {
      roadmapService: fakeRoadmapService,
      roadmapRepository: new FakeRoadmapRepository(),
    },
    user: { userService: fakeUserService, userRepository: fakeUserRepo },
    storage: { storageService: fakeStorageService },
    category: {
      categoryService: {
        getAll: () => Promise.resolve([]),
        create: () => Promise.resolve({}),
      },
      categoryRepository: new FakeCategoryRepository(),
    },
    admin: {
      adminService: {
        getStats: () =>
          Promise.resolve({
            userCount: 0,
            documentCount: 0,
            roadmapCount: 0,
            quizCount: 0,
            documentsByStage: {},
          }),
        getQueueStats: () =>
          Promise.resolve({
            documentQueue: {
              name: 'document-processing',
              counts: {},
              recentFailures: [],
            },
            roadmapQueue: {
              name: 'roadmap-generation',
              counts: {},
              recentFailures: [],
            },
          }),
        getUsers: () => Promise.resolve([]),
        updateUser: () => Promise.resolve({}),
        deleteUser: () => Promise.resolve({ success: true }),
        getRoadmaps: () =>
          Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
        deleteRoadmap: () => Promise.resolve({ success: true }),
        toggleRoadmapFeatured: () =>
          Promise.resolve({ id: '', isFeatured: false }),
        getDocuments: () =>
          Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
        deleteDocument: () => Promise.resolve({ success: true }),
        getAnalytics: () =>
          Promise.resolve({ signups: [], uploads: [], generations: [] }),
      },
      adminRepository: {
        countUsers: () => Promise.resolve(0),
        countDocuments: () => Promise.resolve(0),
        countRoadmaps: () => Promise.resolve(0),
        countQuizzes: () => Promise.resolve(0),
        getDocumentCountsByStage: () => Promise.resolve({}),
        findAllUsers: () => Promise.resolve([]),
        findUserById: () => Promise.resolve(null),
        updateUser: () => Promise.resolve({}),
        deleteUser: () => Promise.resolve(),
        findRoadmaps: () => Promise.resolve({ data: [], total: 0 }),
        findRoadmapById: () => Promise.resolve(null),
        deleteRoadmap: () => Promise.resolve(),
        updateRoadmapFeatured: () =>
          Promise.resolve({ id: '', isFeatured: false }),
        findDocuments: () => Promise.resolve({ data: [], total: 0 }),
        documentExists: () => Promise.resolve(false),
        deleteDocument: () => Promise.resolve(),
        getSignupsByDay: () => Promise.resolve([]),
        getUploadsByDay: () => Promise.resolve([]),
        getGenerationsByDay: () => Promise.resolve([]),
      },
      queueStatsProvider: {
        getDocumentQueueStats: () =>
          Promise.resolve({
            name: 'document-processing',
            counts: {},
            recentFailures: [],
          }),
        getRoadmapQueueStats: () =>
          Promise.resolve({
            name: 'roadmap-generation',
            counts: {},
            recentFailures: [],
          }),
      },
    },
    insights: {
      newsArticleRepository: {
        upsertMany: () => Promise.resolve(),
        findByCategorySlugs: () => Promise.resolve([]),
        deleteOlderThan: () => Promise.resolve(0),
      },
      getInsightsUseCase: { execute: () => Promise.resolve([]) },
    },
    invitation: {
      invitationRepository: new FakeInvitationRepository(),
      createInvitationUseCase: { execute: () => Promise.resolve({}) },
      findAllInvitationsUseCase: { execute: () => Promise.resolve([]) },
      revokeInvitationUseCase: {
        execute: () => Promise.resolve({ success: true }),
      },
      validateInvitationTokenUseCase: { execute: () => Promise.resolve(null) },
      acceptInvitationUseCase: { execute: () => Promise.resolve() },
      createUserDirectUseCase: { execute: () => Promise.resolve({}) },
    },
    fileStorage: fakeFileStorage,
    neo4jService: { close: async () => {} },
    newsService: new FakeNewsService(),
  };

  // Override the bootstrap function to return fakes
  bootstrapModule.bootstrap = () => fakeDeps;
  bootstrapModule.getDependencies = () => fakeDeps;

  return fakeDeps;
}

export async function createTestApp(): Promise<TestContext> {
  // Patch bootstrap BEFORE creating the NestJS module
  patchBootstrapSingleton();

  const fakeTokenStore = new FakeTokenStore();
  const fakePasswordHasher = new FakePasswordHasher();
  const fakeEmailService = new FakeEmailService();
  const fakeCacheService = new FakeCacheService();
  const fakeUserService = new FakeUserService();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    // ─── Override Auth infra ─────────────────────────────────────────
    .overrideProvider(TOKEN_STORE)
    .useValue(fakeTokenStore)
    .overrideProvider(PASSWORD_HASHER)
    .useValue(fakePasswordHasher)
    .overrideProvider(EMAIL_SERVICE_PORT)
    .useValue(fakeEmailService)
    // Keep real JwtTokenService so JwtStrategy can verify tokens
    .overrideProvider('REDIS_CLIENT')
    .useValue({ quit: async () => {} })
    // ─── Override Cache infra ────────────────────────────────────────
    .overrideProvider('CACHE_REDIS_CLIENT')
    .useValue({
      quit: async () => {},
      get: () => Promise.resolve(null),
      set: async () => {},
      del: async () => {},
      keys: () => Promise.resolve([]),
    })
    .overrideProvider(RedisCacheService)
    .useValue(fakeCacheService)
    // ─── Override BullMQ ─────────────────────────────────────────────
    .overrideProvider('DOCUMENT_QUEUE_EVENTS')
    .useValue(new StubQueueEvents())
    .overrideProvider('ROADMAP_QUEUE_EVENTS')
    .useValue(new StubQueueEvents())
    .overrideProvider('DOCUMENT_QUEUE')
    .useValue(new StubQueue())
    .overrideProvider('ROADMAP_QUEUE')
    .useValue(new StubQueue())
    // ─── Override Prisma (for AdminModule) ────────────────────────────
    .overrideProvider(PrismaService)
    .useValue(new StubPrismaService())
    // ─── Override Category (CategoryModule uses getDependencies()) ─────
    .overrideProvider(CATEGORY_REPOSITORY)
    .useValue(new FakeCategoryRepository())
    .overrideProvider(CATEGORY_SERVICE)
    .useValue({
      getAll: () => Promise.resolve([]),
      create: () => Promise.resolve({}),
    })
    // ─── Override Invitation infra ──────────────────────────────────────
    .overrideProvider(INVITATION_REPOSITORY)
    .useValue(new FakeInvitationRepository())
    // ─── Override Insights deps (InsightsModule uses getDependencies()) ─
    .overrideProvider(USER_REPOSITORY)
    .useValue(new FakeUserRepository())
    .overrideProvider(ROADMAP_REPOSITORY)
    .useValue(new FakeRoadmapRepository())
    .overrideProvider(NEWS_SERVICE)
    .useValue(new FakeNewsService())
    .overrideProvider('GetInsightsUseCase')
    .useValue({ execute: () => Promise.resolve({ news: [], stats: {} }) })
    // ─── Override Health indicators' Neo4j dependency ─────────────────
    .overrideProvider('NEO4J_SERVICE')
    .useValue({ close: async () => {}, verifyConnectivity: async () => {} })
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  await app.init();

  return {
    app,
    fakes: {
      tokenStore: fakeTokenStore,
      passwordHasher: fakePasswordHasher,
      emailService: fakeEmailService,
      cache: fakeCacheService,
      userService: fakeUserService,
    },
  };
}
