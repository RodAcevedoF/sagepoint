import type {
  IUserRepository,
  ICategoryRepository,
  IDocumentRepository,
  IRoadmapRepository,
  IProgressRepository,
  IResourceRepository,
  IQuestionRepository,
  IQuizAttemptRepository,
  IStepQuizAttemptRepository,
  IQuizRepository,
  IDocumentSummaryRepository,
  IConceptRepository,
  IInvitationRepository,
  IFileStorage,
  IDocumentProcessingQueue,
  ICacheService,
  IResourceDiscoveryService,
  IQuizGenerationService,
  IConceptExpansionService,
  CursorPaginationParams,
  CursorPaginatedResult,
  RoadmapProgressSummary,
  ConceptGraph,
  DiscoveredResource,
  GeneratedQuestion,
  SubConceptResult,
} from '@sagepoint/domain';
import {
  User,
  Category,
  Document,
  Roadmap,
  UserRoadmapProgress,
  Resource,
  Question,
  QuizAttempt,
  StepQuizAttempt,
  StepStatus,
  Quiz,
  DocumentSummary,
  Concept,
  Invitation,
  InvitationStatus,
  UserRole,
} from '@sagepoint/domain';
import { RoadmapVisibility } from '@sagepoint/domain';
import type { ITokenStore } from '../../../src/features/auth/domain/outbound/token-store.port';
import type { ITokenService } from '../../../src/features/auth/domain/outbound/token-service.port';
import type { IPasswordHasher } from '../../../src/features/auth/domain/outbound/password-hasher.port';
import type { IEmailService } from '../../../src/features/auth/domain/outbound/email.service.port';
import type {
  IUserService,
  CreateUserInput,
} from '../../../src/features/user/domain/inbound/user.service';
import { randomUUID } from 'crypto';

// ─── User ────────────────────────────────────────────────────────────────────

export class FakeUserRepository implements IUserRepository {
  private users: User[] = [];

  seed(...users: User[]) {
    this.users.push(...users);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((u) => u.googleId === googleId) ?? null,
    );
  }

  save(user: User): Promise<void> {
    this.users = this.users.filter((u) => u.id !== user.id);
    this.users.push(user);
    return Promise.resolve();
  }

  getById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}

// ─── Category ────────────────────────────────────────────────────────────────

export class FakeCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];

  seed(...categories: Category[]) {
    this.categories.push(...categories);
  }

  save(category: Category): Promise<Category> {
    this.categories = this.categories.filter((c) => c.id !== category.id);
    this.categories.push(category);
    return Promise.resolve(category);
  }

  findById(id: string): Promise<Category | null> {
    return Promise.resolve(this.categories.find((c) => c.id === id) ?? null);
  }

  findBySlug(slug: string): Promise<Category | null> {
    return Promise.resolve(
      this.categories.find((c) => c.slug === slug) ?? null,
    );
  }

  list(): Promise<Category[]> {
    return Promise.resolve([...this.categories]);
  }

  listWithActiveInterests(): Promise<Category[]> {
    return Promise.resolve([...this.categories]);
  }

  delete(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
    return Promise.resolve();
  }
}

// ─── Document ────────────────────────────────────────────────────────────────

export class FakeDocumentRepository implements IDocumentRepository {
  private documents: Document[] = [];

  seed(...docs: Document[]) {
    this.documents.push(...docs);
  }

  save(document: Document): Promise<void> {
    this.documents = this.documents.filter((d) => d.id !== document.id);
    this.documents.push(document);
    return Promise.resolve();
  }

  findById(id: string): Promise<Document | null> {
    return Promise.resolve(this.documents.find((d) => d.id === id) ?? null);
  }

  findAll(): Promise<Document[]> {
    return Promise.resolve([...this.documents]);
  }

  findByUserId(userId: string): Promise<Document[]> {
    return Promise.resolve(this.documents.filter((d) => d.userId === userId));
  }

  findByUserIdCursor(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Document>> {
    const userDocs = this.documents.filter((d) => d.userId === userId);
    const limit = params.limit ?? 10;
    const data = userDocs.slice(0, limit);
    return Promise.resolve({
      data,
      nextCursor: null,
      hasMore: userDocs.length > limit,
      total: userDocs.length,
    });
  }

  delete(id: string): Promise<void> {
    this.documents = this.documents.filter((d) => d.id !== id);
    return Promise.resolve();
  }

  updateStatus(): Promise<void> {
    return Promise.resolve();
  }

  getAll(): Document[] {
    return [...this.documents];
  }
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export class FakeRoadmapRepository implements IRoadmapRepository {
  private roadmaps: Roadmap[] = [];

  seed(...roadmaps: Roadmap[]) {
    this.roadmaps.push(...roadmaps);
  }

  save(roadmap: Roadmap): Promise<Roadmap> {
    this.roadmaps = this.roadmaps.filter((r) => r.id !== roadmap.id);
    this.roadmaps.push(roadmap);
    return Promise.resolve(roadmap);
  }

  findById(id: string): Promise<Roadmap | null> {
    return Promise.resolve(this.roadmaps.find((r) => r.id === id) ?? null);
  }

  findByDocumentId(documentId: string): Promise<Roadmap[]> {
    return Promise.resolve(
      this.roadmaps.filter((r) => r.documentId === documentId),
    );
  }

  findByUserId(userId: string): Promise<Roadmap[]> {
    return Promise.resolve(this.roadmaps.filter((r) => r.userId === userId));
  }

  findPublic(): Promise<Roadmap[]> {
    return Promise.resolve(
      this.roadmaps.filter((r) => r.visibility === RoadmapVisibility.PUBLIC),
    );
  }

  updateVisibility(
    id: string,
    visibility: RoadmapVisibility,
  ): Promise<Roadmap> {
    const roadmap = this.roadmaps.find((r) => r.id === id);
    if (!roadmap) throw new Error('Roadmap not found');
    const updated = new Roadmap({
      ...roadmap,
      visibility,
      createdAt: roadmap.createdAt,
    });
    this.roadmaps = this.roadmaps.filter((r) => r.id !== id);
    this.roadmaps.push(updated);
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<void> {
    this.roadmaps = this.roadmaps.filter((r) => r.id !== id);
    return Promise.resolve();
  }

  updateGeneration(): Promise<void> {
    return Promise.resolve();
  }

  saveConcept(concept: Concept): Promise<Concept> {
    return Promise.resolve(concept);
  }
  findConceptsByDocumentId(): Promise<Concept[]> {
    return Promise.resolve([]);
  }
  saveConceptRelation(): Promise<void> {
    return Promise.resolve();
  }
}

// ─── Progress ────────────────────────────────────────────────────────────────

export class FakeProgressRepository implements IProgressRepository {
  private entries: UserRoadmapProgress[] = [];

  seed(...entries: UserRoadmapProgress[]) {
    this.entries.push(...entries);
  }

  upsert(progress: UserRoadmapProgress): Promise<UserRoadmapProgress> {
    this.entries = this.entries.filter(
      (e) =>
        !(
          e.userId === progress.userId &&
          e.roadmapId === progress.roadmapId &&
          e.conceptId === progress.conceptId
        ),
    );
    this.entries.push(progress);
    return Promise.resolve(progress);
  }

  findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapProgress[]> {
    return Promise.resolve(
      this.entries.filter(
        (e) => e.userId === userId && e.roadmapId === roadmapId,
      ),
    );
  }

  findByUserRoadmapAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string,
  ): Promise<UserRoadmapProgress | null> {
    return Promise.resolve(
      this.entries.find(
        (e) =>
          e.userId === userId &&
          e.roadmapId === roadmapId &&
          e.conceptId === conceptId,
      ) ?? null,
    );
  }

  async upsertMany(
    progressList: UserRoadmapProgress[],
  ): Promise<UserRoadmapProgress[]> {
    for (const p of progressList) await this.upsert(p);
    return progressList;
  }

  getProgressSummary(
    userId: string,
    roadmapId: string,
  ): Promise<RoadmapProgressSummary | null> {
    const entries = this.entries.filter(
      (e) => e.userId === userId && e.roadmapId === roadmapId,
    );
    if (entries.length === 0) return Promise.resolve(null);
    const completed = entries.filter(
      (e) => e.status === StepStatus.COMPLETED,
    ).length;
    const inProgress = entries.filter(
      (e) => e.status === StepStatus.IN_PROGRESS,
    ).length;
    const skipped = entries.filter(
      (e) => e.status === StepStatus.SKIPPED,
    ).length;
    const total = entries.length;
    return Promise.resolve({
      roadmapId,
      totalSteps: total,
      completedSteps: completed,
      inProgressSteps: inProgress,
      skippedSteps: skipped,
      progressPercentage: Math.round((completed / total) * 100),
    });
  }

  async getProgressSummariesForUser(
    userId: string,
  ): Promise<RoadmapProgressSummary[]> {
    const roadmapIds = [
      ...new Set(
        this.entries.filter((e) => e.userId === userId).map((e) => e.roadmapId),
      ),
    ];
    const summaries: RoadmapProgressSummary[] = [];
    for (const rid of roadmapIds) {
      const s = await this.getProgressSummary(userId, rid);
      if (s) summaries.push(s);
    }
    return summaries;
  }

  getCompletedConceptIds(userId: string, roadmapId: string): Promise<string[]> {
    return Promise.resolve(
      this.entries
        .filter(
          (e) =>
            e.userId === userId &&
            e.roadmapId === roadmapId &&
            e.status === StepStatus.COMPLETED,
        )
        .map((e) => e.conceptId),
    );
  }

  deleteByRoadmap(roadmapId: string): Promise<void> {
    this.entries = this.entries.filter((e) => e.roadmapId !== roadmapId);
    return Promise.resolve();
  }

  deleteByUserAndRoadmap(userId: string, roadmapId: string): Promise<void> {
    this.entries = this.entries.filter(
      (e) => !(e.userId === userId && e.roadmapId === roadmapId),
    );
    return Promise.resolve();
  }
}

// ─── Resource ────────────────────────────────────────────────────────────────

export class FakeResourceRepository implements IResourceRepository {
  private resources: Resource[] = [];

  seed(...resources: Resource[]) {
    this.resources.push(...resources);
  }

  save(resource: Resource): Promise<Resource> {
    this.resources.push(resource);
    return Promise.resolve(resource);
  }

  saveMany(resources: Resource[]): Promise<Resource[]> {
    this.resources.push(...resources);
    return Promise.resolve(resources);
  }

  findByRoadmapId(roadmapId: string): Promise<Resource[]> {
    return Promise.resolve(
      this.resources.filter((r) => r.roadmapId === roadmapId),
    );
  }

  findByConceptId(conceptId: string): Promise<Resource[]> {
    return Promise.resolve(
      this.resources.filter((r) => r.conceptId === conceptId),
    );
  }

  deleteByRoadmapId(roadmapId: string): Promise<void> {
    this.resources = this.resources.filter((r) => r.roadmapId !== roadmapId);
    return Promise.resolve();
  }
}

// ─── Question ────────────────────────────────────────────────────────────────

export class FakeQuestionRepository implements IQuestionRepository {
  private questions: Question[] = [];

  seed(...questions: Question[]) {
    this.questions.push(...questions);
  }

  saveMany(questions: Question[]): Promise<void> {
    this.questions.push(...questions);
    return Promise.resolve();
  }

  findByQuizId(quizId: string): Promise<Question[]> {
    return Promise.resolve(this.questions.filter((q) => q.quizId === quizId));
  }

  deleteByQuizId(quizId: string): Promise<void> {
    this.questions = this.questions.filter((q) => q.quizId !== quizId);
    return Promise.resolve();
  }
}

// ─── QuizAttempt ─────────────────────────────────────────────────────────────

export class FakeQuizAttemptRepository implements IQuizAttemptRepository {
  private attempts: QuizAttempt[] = [];

  save(attempt: QuizAttempt): Promise<void> {
    this.attempts.push(attempt);
    return Promise.resolve();
  }

  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return Promise.resolve(
      this.attempts.filter((a) => a.userId === userId && a.quizId === quizId),
    );
  }

  findByUser(userId: string): Promise<QuizAttempt[]> {
    return Promise.resolve(this.attempts.filter((a) => a.userId === userId));
  }

  getAll(): QuizAttempt[] {
    return [...this.attempts];
  }
}

// ─── StepQuizAttempt ─────────────────────────────────────────────────────────

export class FakeStepQuizAttemptRepository implements IStepQuizAttemptRepository {
  private attempts: StepQuizAttempt[] = [];

  seed(...attempts: StepQuizAttempt[]) {
    this.attempts.push(...attempts);
  }

  create(attempt: StepQuizAttempt): Promise<StepQuizAttempt> {
    this.attempts.push(attempt);
    return Promise.resolve(attempt);
  }

  findById(id: string): Promise<StepQuizAttempt | null> {
    return Promise.resolve(this.attempts.find((a) => a.id === id) ?? null);
  }

  findPendingByUserAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string,
  ): Promise<StepQuizAttempt | null> {
    return Promise.resolve(
      this.attempts.find(
        (a) =>
          a.userId === userId &&
          a.roadmapId === roadmapId &&
          a.conceptId === conceptId &&
          !a.completedAt,
      ) ?? null,
    );
  }

  update(attempt: StepQuizAttempt): Promise<StepQuizAttempt> {
    this.attempts = this.attempts.filter((a) => a.id !== attempt.id);
    this.attempts.push(attempt);
    return Promise.resolve(attempt);
  }

  getById(id: string): StepQuizAttempt | undefined {
    return this.attempts.find((a) => a.id === id);
  }
}

// ─── FileStorage ─────────────────────────────────────────────────────────────

export class FakeFileStorage implements IFileStorage {
  private files = new Map<string, Buffer>();

  upload(path: string, content: Buffer): Promise<string> {
    this.files.set(path, content);
    return Promise.resolve(path);
  }

  download(path: string): Promise<Buffer> {
    return Promise.resolve(this.files.get(path) ?? Buffer.from(''));
  }

  delete(path: string): Promise<void> {
    this.files.delete(path);
    return Promise.resolve();
  }

  getUrl(path: string): Promise<string> {
    return Promise.resolve(`https://storage.example.com/${path}`);
  }

  has(path: string): boolean {
    return this.files.has(path);
  }
}

// ─── Processing Queue ────────────────────────────────────────────────────────

export class FakeProcessingQueue implements IDocumentProcessingQueue {
  public jobs: Array<{
    documentId: string;
    storagePath: string;
    filename: string;
    mimeType: string;
  }> = [];

  add(
    documentId: string,
    storagePath: string,
    filename: string,
    mimeType: string,
  ): Promise<void> {
    this.jobs.push({ documentId, storagePath, filename, mimeType });
    return Promise.resolve();
  }
}

// ─── Cache ───────────────────────────────────────────────────────────────────

export class FakeCacheService implements ICacheService {
  private store = new Map<string, unknown>();

  get<T>(key: string): Promise<T | null> {
    return Promise.resolve((this.store.get(key) as T) ?? null);
  }

  set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  delByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
    return Promise.resolve();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

export class FakeQuizRepository implements IQuizRepository {
  private quizzes: Quiz[] = [];

  seed(...quizzes: Quiz[]) {
    this.quizzes.push(...quizzes);
  }

  save(quiz: Quiz): Promise<void> {
    this.quizzes = this.quizzes.filter((q) => q.id !== quiz.id);
    this.quizzes.push(quiz);
    return Promise.resolve();
  }

  findById(id: string): Promise<Quiz | null> {
    return Promise.resolve(this.quizzes.find((q) => q.id === id) ?? null);
  }

  findByDocumentId(documentId: string): Promise<Quiz[]> {
    return Promise.resolve(
      this.quizzes.filter((q) => q.documentId === documentId),
    );
  }

  delete(id: string): Promise<void> {
    this.quizzes = this.quizzes.filter((q) => q.id !== id);
    return Promise.resolve();
  }
}

// ─── DocumentSummary ─────────────────────────────────────────────────────────

export class FakeDocumentSummaryRepository implements IDocumentSummaryRepository {
  private summaries: DocumentSummary[] = [];

  seed(...summaries: DocumentSummary[]) {
    this.summaries.push(...summaries);
  }

  save(summary: DocumentSummary): Promise<void> {
    this.summaries = this.summaries.filter(
      (s) => s.documentId !== summary.documentId,
    );
    this.summaries.push(summary);
    return Promise.resolve();
  }

  findByDocumentId(documentId: string): Promise<DocumentSummary | null> {
    return Promise.resolve(
      this.summaries.find((s) => s.documentId === documentId) ?? null,
    );
  }

  deleteByDocumentId(documentId: string): Promise<void> {
    this.summaries = this.summaries.filter((s) => s.documentId !== documentId);
    return Promise.resolve();
  }
}

// ─── Concept ─────────────────────────────────────────────────────────────────

export class FakeConceptRepository implements IConceptRepository {
  private concepts: Concept[] = [];
  private relations: Array<{ fromId: string; toId: string; type: string }> = [];

  seed(...concepts: Concept[]) {
    this.concepts.push(...concepts);
  }

  seedRelations(
    ...relations: Array<{ fromId: string; toId: string; type: string }>
  ) {
    this.relations.push(...relations);
  }

  save(concept: Concept): Promise<void> {
    this.concepts = this.concepts.filter((c) => c.id !== concept.id);
    this.concepts.push(concept);
    return Promise.resolve();
  }

  async saveWithRelations(
    concepts: Concept[],
    relationships: Array<{ fromId: string; toId: string; type: string }>,
  ): Promise<void> {
    for (const c of concepts) await this.save(c);
    this.relations.push(...relationships);
  }

  findById(id: string): Promise<Concept | null> {
    return Promise.resolve(this.concepts.find((c) => c.id === id) ?? null);
  }

  getGraphByDocumentId(documentId: string): Promise<ConceptGraph> {
    const nodes = this.concepts.filter((c) => c.documentId === documentId);
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = this.relations.filter(
      (r) => nodeIds.has(r.fromId) || nodeIds.has(r.toId),
    );
    return Promise.resolve({
      nodes,
      edges: edges.map((r) => ({ from: r.fromId, to: r.toId, type: r.type })),
    });
  }

  findRelatedConcepts(): Promise<ConceptGraph> {
    return Promise.resolve({ nodes: [], edges: [] });
  }

  addSubConceptRelation(parentId: string, childId: string): Promise<void> {
    this.relations.push({
      fromId: parentId,
      toId: childId,
      type: 'HAS_SUBCONCEPT',
    });
    return Promise.resolve();
  }

  findRelatedNotInSet(conceptIds: string[]): Promise<Concept[]> {
    const idSet = new Set(conceptIds);
    // Find concepts related via edges but not in the given set
    const relatedIds = new Set<string>();
    for (const rel of this.relations) {
      if (idSet.has(rel.fromId) && !idSet.has(rel.toId))
        relatedIds.add(rel.toId);
      if (idSet.has(rel.toId) && !idSet.has(rel.fromId))
        relatedIds.add(rel.fromId);
    }
    return Promise.resolve(this.concepts.filter((c) => relatedIds.has(c.id)));
  }
}

// ─── Invitation ─────────────────────────────────────────────────────────────

export class FakeInvitationRepository implements IInvitationRepository {
  private invitations: Invitation[] = [];

  seed(...invitations: Invitation[]) {
    this.invitations.push(...invitations);
  }

  save(invitation: Invitation): Promise<void> {
    this.invitations = this.invitations.filter((i) => i.id !== invitation.id);
    this.invitations.push(invitation);
    return Promise.resolve();
  }

  findById(id: string): Promise<Invitation | null> {
    return Promise.resolve(this.invitations.find((i) => i.id === id) ?? null);
  }

  findByToken(token: string): Promise<Invitation | null> {
    return Promise.resolve(
      this.invitations.find((i) => i.token === token) ?? null,
    );
  }

  findPendingByEmail(email: string): Promise<Invitation | null> {
    return Promise.resolve(
      this.invitations.find(
        (i) =>
          i.email === email &&
          i.status === InvitationStatus.PENDING &&
          i.expiresAt > new Date(),
      ) ?? null,
    );
  }

  findAll(): Promise<Invitation[]> {
    return Promise.resolve([...this.invitations]);
  }

  getAll(): Invitation[] {
    return [...this.invitations];
  }
}

// ─── Auth: TokenStore ────────────────────────────────────────────────────────

export class FakeTokenStore implements ITokenStore {
  private verificationTokens = new Map<string, string>(); // token → userId
  private refreshTokens = new Map<string, string>(); // userId → token

  storeVerificationToken(
    userId: string,
    token: string,
    _ttl?: number,
  ): Promise<void> {
    this.verificationTokens.set(token, userId);
    return Promise.resolve();
  }

  getVerificationToken(token: string): Promise<string | null> {
    return Promise.resolve(this.verificationTokens.get(token) ?? null);
  }

  deleteVerificationToken(token: string): Promise<void> {
    this.verificationTokens.delete(token);
    return Promise.resolve();
  }

  storeRefreshToken(
    userId: string,
    token: string,
    _ttl?: number,
  ): Promise<void> {
    this.refreshTokens.set(userId, token);
    return Promise.resolve();
  }

  getRefreshToken(userId: string): Promise<string | null> {
    return Promise.resolve(this.refreshTokens.get(userId) ?? null);
  }

  deleteRefreshToken(userId: string): Promise<void> {
    this.refreshTokens.delete(userId);
    return Promise.resolve();
  }

  hasRefreshToken(userId: string): boolean {
    return this.refreshTokens.has(userId);
  }

  hasVerificationToken(token: string): boolean {
    return this.verificationTokens.has(token);
  }
}

// ─── Auth: TokenService ──────────────────────────────────────────────────────

export class FakeTokenService implements ITokenService {
  private tokenCounter = 0;

  signAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): string {
    this.tokenCounter++;
    return `access-token-${payload.sub}-${this.tokenCounter}`;
  }

  signRefreshToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): string {
    this.tokenCounter++;
    return `refresh-token-${payload.sub}-${this.tokenCounter}`;
  }

  verifyRefreshToken(token: string): {
    sub: string;
    email: string;
    role: string;
  } {
    // Parse the userId from the fake token format
    const match = token.match(/^refresh-token-(.+)-\d+$/);
    if (!match) throw new Error('Invalid refresh token');
    return { sub: match[1], email: '', role: 'USER' };
  }
}

// ─── Auth: PasswordHasher ────────────────────────────────────────────────────

export class FakePasswordHasher implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return Promise.resolve(`hashed:${password}`);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${password}`);
  }
}

// ─── Auth: EmailService ──────────────────────────────────────────────────────

export class FakeEmailService implements IEmailService {
  public sentEmails: Array<{ email: string; token: string }> = [];

  sendVerificationEmail(email: string, token: string): Promise<void> {
    this.sentEmails.push({ email, token });
    return Promise.resolve();
  }

  sendInvitationEmail(email: string, token: string): Promise<void> {
    this.sentEmails.push({ email, token });
    return Promise.resolve();
  }
}

// ─── UserService ─────────────────────────────────────────────────────────────

export class FakeUserService implements IUserService {
  private users: User[] = [];

  seed(...users: User[]) {
    this.users.push(...users);
  }

  create(input: CreateUserInput): Promise<User> {
    const id = randomUUID();
    const user = new User(
      id,
      input.email,
      input.name,
      input.role ?? UserRole.USER,
      undefined, // avatarUrl
      true, // isActive
      false, // isVerified
      null, // verificationToken
      input.passwordHash ?? null,
      null, // googleId
      null, // learningGoal
    );
    this.users.push(user);
    return Promise.resolve(user);
  }

  save(user: User): Promise<void> {
    this.users = this.users.filter((u) => u.id !== user.id);
    this.users.push(user);
    return Promise.resolve();
  }

  get(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  getByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }

  getByGoogleId(googleId: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((u) => u.googleId === googleId) ?? null,
    );
  }

  updateProfile(userId: string): Promise<User> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return Promise.resolve(user);
  }

  completeOnboarding(): Promise<void> {
    return Promise.resolve();
  }

  getById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}

// ─── ResourceDiscoveryService ────────────────────────────────────────────────

export class FakeResourceDiscoveryService implements IResourceDiscoveryService {
  private results: DiscoveredResource[] = [];

  setResults(results: DiscoveredResource[]) {
    this.results = results;
  }

  discoverResourcesForConcept(): Promise<DiscoveredResource[]> {
    return Promise.resolve([...this.results]);
  }

  discoverResourcesForConcepts(
    concepts: Array<{ id: string; name: string; description?: string }>,
  ): Promise<Map<string, DiscoveredResource[]>> {
    const map = new Map<string, DiscoveredResource[]>();
    for (const concept of concepts) {
      map.set(concept.id, [...this.results]);
    }
    return Promise.resolve(map);
  }
}

// ─── QuizGenerationService ──────────────────────────────────────────────────

export class FakeQuizGenerationService implements IQuizGenerationService {
  private results: GeneratedQuestion[] = [];

  setResults(results: GeneratedQuestion[]) {
    this.results = results;
  }

  generateQuiz(): Promise<GeneratedQuestion[]> {
    return Promise.resolve([...this.results]);
  }
}

// ─── ConceptExpansionService ─────────────────────────────────────────────────

export class FakeConceptExpansionService implements IConceptExpansionService {
  private results: SubConceptResult[] = [];

  setResults(results: SubConceptResult[]) {
    this.results = results;
  }

  generateSubConcepts(): Promise<SubConceptResult[]> {
    return Promise.resolve([...this.results]);
  }
}
