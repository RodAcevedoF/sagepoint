import type {
  IDocumentRepository,
  DocumentStatusUpdate,
  IDocumentSummaryRepository,
  IQuizRepository,
  IQuestionRepository,
  IRoadmapRepository,
  RoadmapGenerationUpdate,
  IResourceRepository,
  ICategoryRepository,
  Document,
  DocumentStatus,
  ProcessingStage,
  DocumentSummary,
  Quiz,
  Question,
  Roadmap,
  RoadmapGenerationStatus,
  RoadmapStep,
  RoadmapVisibility,
  Concept,
  Resource,
  Category,
} from "@sagepoint/domain";

// ─── Document ─────────────────────────────────────────────────────────────────

export class FakeDocumentRepository implements IDocumentRepository {
  private docs = new Map<
    string,
    {
      id: string;
      status: DocumentStatus;
      processingStage: ProcessingStage;
      conceptCount?: number;
      errorMessage?: string;
    }
  >();

  seedDocument(id: string) {
    this.docs.set(id, {
      id,
      status: "PENDING" as DocumentStatus,
      processingStage: "PENDING" as ProcessingStage,
    });
  }

  getDocument(id: string) {
    return this.docs.get(id);
  }

  save(_doc: Document): Promise<void> {
    return Promise.resolve();
  }

  findById(_id: string): Promise<Document | null> {
    return Promise.resolve(null);
  }

  findAll(): Promise<Document[]> {
    return Promise.resolve([]);
  }

  findByUserId(_userId: string): Promise<Document[]> {
    return Promise.resolve([]);
  }

  findByUserIdCursor(): Promise<never> {
    return Promise.reject(new Error("not implemented"));
  }

  updateStatus(id: string, fields: DocumentStatusUpdate): Promise<void> {
    const existing = this.docs.get(id) ?? {
      id,
      status: "PENDING" as DocumentStatus,
      processingStage: "PENDING" as ProcessingStage,
    };
    this.docs.set(id, { ...existing, ...fields });
    return Promise.resolve();
  }

  delete(_id: string): Promise<void> {
    return Promise.resolve();
  }

  countByUserId(_userId: string): Promise<number> {
    return Promise.resolve(0);
  }
}

// ─── DocumentSummary ──────────────────────────────────────────────────────────

export class FakeDocumentSummaryRepository implements IDocumentSummaryRepository {
  private summaries = new Map<
    string,
    {
      id: string;
      documentId: string;
      overview: string;
      topicArea: string;
      conceptCount?: number;
      [key: string]: unknown;
    }
  >();

  seedSummary(documentId: string): void {
    const id = `summary-${documentId}`;
    this.summaries.set(id, {
      id,
      documentId,
      overview: "Test overview",
      topicArea: "Test Topic",
      conceptCount: 0,
    });
  }

  getSummaryByDocumentId(documentId: string) {
    for (const s of this.summaries.values()) {
      if (s.documentId === documentId) return s;
    }
    return undefined;
  }

  save(summary: DocumentSummary): Promise<void> {
    this.summaries.set(summary.id, {
      id: summary.id,
      documentId: summary.documentId,
      overview: summary.overview,
      topicArea: summary.topicArea,
      conceptCount: summary.conceptCount ?? undefined,
    });
    return Promise.resolve();
  }

  findByDocumentId(documentId: string): Promise<DocumentSummary | null> {
    for (const s of this.summaries.values()) {
      if (s.documentId === documentId)
        return Promise.resolve(s as unknown as DocumentSummary);
    }
    return Promise.resolve(null);
  }

  deleteByDocumentId(_documentId: string): Promise<void> {
    return Promise.resolve();
  }

  delete(_id: string): Promise<void> {
    return Promise.resolve();
  }
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export class FakeQuizRepository implements IQuizRepository {
  private quizzes = new Map<
    string,
    { id: string; documentId: string; questionCount: number }
  >();

  getQuizByDocumentId(documentId: string) {
    for (const q of this.quizzes.values()) {
      if (q.documentId === documentId) return q;
    }
    return undefined;
  }

  save(quiz: Quiz): Promise<void> {
    this.quizzes.set(quiz.id, {
      id: quiz.id,
      documentId: quiz.documentId,
      questionCount: quiz.questionCount,
    });
    return Promise.resolve();
  }

  findById(id: string): Promise<Quiz | null> {
    const q = this.quizzes.get(id);
    return Promise.resolve(q ? (q as unknown as Quiz) : null);
  }

  findByDocumentId(documentId: string): Promise<Quiz[]> {
    const result: Quiz[] = [];
    for (const q of this.quizzes.values()) {
      if (q.documentId === documentId) result.push(q as unknown as Quiz);
    }
    return Promise.resolve(result);
  }

  delete(_id: string): Promise<void> {
    return Promise.resolve();
  }
}

// ─── Question ─────────────────────────────────────────────────────────────────

export class FakeQuestionRepository implements IQuestionRepository {
  private questions: Array<{ id: string; quizId: string }> = [];

  getQuestionsByQuizId(quizId: string) {
    return this.questions.filter((q) => q.quizId === quizId);
  }

  saveMany(questions: Question[]): Promise<void> {
    for (const q of questions) {
      this.questions.push({ id: q.id, quizId: q.quizId });
    }
    return Promise.resolve();
  }

  findByQuizId(_quizId: string): Promise<Question[]> {
    return Promise.resolve([]);
  }

  deleteByQuizId(_quizId: string): Promise<void> {
    return Promise.resolve();
  }
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export class FakeRoadmapRepository implements IRoadmapRepository {
  private roadmaps = new Map<
    string,
    {
      id: string;
      generationStatus?: RoadmapGenerationStatus;
      description?: string;
      recommendedPace?: string;
      totalEstimatedDuration?: number;
      steps?: RoadmapStep[];
      categoryId?: string;
      errorMessage?: string;
    }
  >();

  seedRoadmap(id: string) {
    this.roadmaps.set(id, { id });
  }

  getRoadmap(id: string) {
    return this.roadmaps.get(id);
  }

  save(_roadmap: Roadmap): Promise<Roadmap> {
    return Promise.resolve(_roadmap);
  }

  findById(_id: string): Promise<Roadmap | null> {
    return Promise.resolve(null);
  }

  findByDocumentId(_documentId: string): Promise<Roadmap[]> {
    return Promise.resolve([]);
  }

  findByUserId(_userId: string): Promise<Roadmap[]> {
    return Promise.resolve([]);
  }

  findPublic(): Promise<Roadmap[]> {
    return Promise.resolve([]);
  }

  searchPublic(_query: string, _limit?: number): Promise<Roadmap[]> {
    return Promise.resolve([]);
  }

  updateVisibility(
    _id: string,
    _visibility: RoadmapVisibility,
  ): Promise<Roadmap> {
    return Promise.reject(new Error("not implemented"));
  }

  updateGeneration(id: string, fields: RoadmapGenerationUpdate): Promise<void> {
    const existing = this.roadmaps.get(id) ?? { id };
    this.roadmaps.set(id, { ...existing, ...fields });
    return Promise.resolve();
  }

  delete(_id: string): Promise<void> {
    return Promise.resolve();
  }

  saveConcept(concept: Concept): Promise<Concept> {
    return Promise.resolve(concept);
  }

  findConceptsByDocumentId(_documentId: string): Promise<Concept[]> {
    return Promise.resolve([]);
  }

  saveConceptRelation(
    _fromConceptId: string,
    _toConceptId: string,
    _relationType: "DEPENDS_ON" | "NEXT_STEP",
  ): Promise<void> {
    return Promise.resolve();
  }

  countByUserId(_userId: string): Promise<number> {
    return Promise.resolve(0);
  }
}

// ─── Resource ─────────────────────────────────────────────────────────────────

export class FakeResourceRepository implements IResourceRepository {
  private resources: Resource[] = [];

  getResourcesByRoadmapId(roadmapId: string) {
    return this.resources.filter((r) => r.roadmapId === roadmapId);
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

  deleteByRoadmapId(_roadmapId: string): Promise<void> {
    return Promise.resolve();
  }
}

// ─── Category ─────────────────────────────────────────────────────────────────

export class FakeCategoryRepository implements ICategoryRepository {
  private categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
  }> = [];

  seedCategory(cat: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }) {
    this.categories.push(cat);
  }

  save(category: Category): Promise<Category> {
    return Promise.resolve(category);
  }

  findOrCreateBySlug(category: Category): Promise<Category> {
    return Promise.resolve(category);
  }

  findById(_id: string): Promise<Category | null> {
    return Promise.resolve(null);
  }

  findBySlug(_slug: string): Promise<Category | null> {
    return Promise.resolve(null);
  }

  list(): Promise<Category[]> {
    return Promise.resolve(this.categories as unknown as Category[]);
  }

  listWithActiveInterests(): Promise<Category[]> {
    return Promise.resolve([]);
  }

  delete(_id: string): Promise<void> {
    return Promise.resolve();
  }
}
