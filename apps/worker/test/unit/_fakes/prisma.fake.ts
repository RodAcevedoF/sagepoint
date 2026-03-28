/**
 * In-memory fake that mimics the PrismaClient methods used by worker services.
 * Only implements the subset actually called in production code.
 */
export class FakePrismaClient {
  // ─── Document ───────────────────────────────────────────────────────
  private documents = new Map<string, Record<string, unknown>>();

  readonly document = {
    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      const existing = this.documents.get(where.id) ?? { id: where.id };
      const updated = { ...existing, ...data };
      this.documents.set(where.id, updated);
      return Promise.resolve(updated);
    },
  };

  seedDocument(id: string, data: Record<string, unknown> = {}) {
    this.documents.set(id, { id, ...data });
  }

  getDocument(id: string) {
    return this.documents.get(id);
  }

  // ─── DocumentSummary ────────────────────────────────────────────────
  private summaries = new Map<string, Record<string, unknown>>();

  readonly documentSummary = {
    create: ({ data }: { data: Record<string, unknown> }) => {
      const id = data.id as string;
      this.summaries.set(id, data);
      return Promise.resolve(data);
    },
    findFirst: ({ where }: { where: { documentId: string } }) => {
      for (const s of this.summaries.values()) {
        if (s.documentId === where.documentId) return Promise.resolve(s);
      }
      return Promise.resolve(null);
    },
    updateMany: ({
      where,
      data,
    }: {
      where: { documentId: string };
      data: Record<string, unknown>;
    }) => {
      for (const [id, s] of this.summaries.entries()) {
        if (s.documentId === where.documentId) {
          this.summaries.set(id, { ...s, ...data });
        }
      }
      return Promise.resolve({ count: 1 });
    },
  };

  getSummaryByDocumentId(documentId: string) {
    for (const s of this.summaries.values()) {
      if (s.documentId === documentId) return s;
    }
    return undefined;
  }

  // ─── Quiz ───────────────────────────────────────────────────────────
  private quizzes = new Map<string, Record<string, unknown>>();

  readonly quiz = {
    create: ({ data }: { data: Record<string, unknown> }) => {
      this.quizzes.set(data.id as string, data);
      return Promise.resolve(data);
    },
  };

  getQuiz(id: string) {
    return this.quizzes.get(id);
  }

  getQuizByDocumentId(documentId: string) {
    for (const q of this.quizzes.values()) {
      if (q.documentId === documentId) return q;
    }
    return undefined;
  }

  // ─── Question ───────────────────────────────────────────────────────
  private questions: Record<string, unknown>[] = [];

  readonly question = {
    createMany: ({ data }: { data: Record<string, unknown>[] }) => {
      this.questions.push(...data);
      return Promise.resolve({ count: data.length });
    },
  };

  getQuestionsByQuizId(quizId: string) {
    return this.questions.filter((q) => q.quizId === quizId);
  }

  // ─── Roadmap ────────────────────────────────────────────────────────
  private roadmaps = new Map<string, Record<string, unknown>>();

  readonly roadmap = {
    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      const existing = this.roadmaps.get(where.id) ?? { id: where.id };
      const updated = { ...existing, ...data };
      this.roadmaps.set(where.id, updated);
      return Promise.resolve(updated);
    },
  };

  seedRoadmap(id: string, data: Record<string, unknown> = {}) {
    this.roadmaps.set(id, { id, ...data });
  }

  getRoadmap(id: string) {
    return this.roadmaps.get(id);
  }

  // ─── Category ───────────────────────────────────────────────────────
  private categories: Record<string, unknown>[] = [];

  readonly category = {
    findMany: (_args?: unknown) => {
      return Promise.resolve([...this.categories]);
    },
  };

  seedCategory(cat: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }) {
    this.categories.push(cat);
  }

  // ─── NewsArticle ─────────────────────────────────────────────────────
  private newsArticles = new Map<string, Record<string, unknown>>();

  readonly newsArticle = {
    upsert: ({
      where,
      create,
      update,
    }: {
      where: { url: string };
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }) => {
      const existing = [...this.newsArticles.values()].find(
        (a) => a.url === where.url,
      );
      if (existing) {
        const updated = { ...existing, ...update };
        this.newsArticles.set(existing.id as string, updated);
        return Promise.resolve(updated);
      }
      this.newsArticles.set(create.id as string, create);
      return Promise.resolve(create);
    },
    deleteMany: ({ where }: { where: { createdAt: { lt: Date } } }) => {
      let count = 0;
      for (const [id, a] of this.newsArticles.entries()) {
        if ((a.createdAt as Date) < where.createdAt.lt) {
          this.newsArticles.delete(id);
          count++;
        }
      }
      return Promise.resolve({ count });
    },
  };

  getNewsArticles() {
    return [...this.newsArticles.values()];
  }

  seedNewsArticle(article: Record<string, unknown>) {
    this.newsArticles.set(article.id as string, article);
  }

  // ─── $transaction ──────────────────────────────────────────────────
  $transaction(operations: Promise<unknown>[]) {
    return Promise.all(operations);
  }

  // ─── Resource ───────────────────────────────────────────────────────
  private resources: Record<string, unknown>[] = [];

  readonly resource = {
    createMany: ({ data }: { data: Record<string, unknown>[] }) => {
      this.resources.push(...data);
      return Promise.resolve({ count: data.length });
    },
  };

  getResources() {
    return [...this.resources];
  }

  getResourcesByRoadmapId(roadmapId: string) {
    return this.resources.filter((r) => r.roadmapId === roadmapId);
  }
}
