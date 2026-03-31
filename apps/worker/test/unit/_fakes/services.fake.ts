import type {
  IContentAnalysisService,
  IDocumentAnalysisService,
  IQuizGenerationService,
  IImageTextExtractionService,
  ITopicConceptGenerationService,
  IRoadmapGenerationService,
  IResourceDiscoveryService,
  ICacheService,
  INewsService,
  IFileStorage,
  IConceptRepository,
  ExtractedConcept,
  DocumentAnalysisResult,
  GeneratedQuestion,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  DiscoveredResource,
  ResourceDiscoveryOptions,
  ConceptGraph,
  GeneratedLearningPath,
} from "@sagepoint/domain";
import { Concept, NewsArticle } from "@sagepoint/domain";

// ─── FileStorage ──────────────────────────────────────────────────────────────

export class FakeFileStorage implements IFileStorage {
  private files = new Map<string, Buffer>();

  seed(path: string, content: Buffer) {
    this.files.set(path, content);
  }

  upload(path: string, content: Buffer): Promise<string> {
    this.files.set(path, content);
    return Promise.resolve(path);
  }

  download(path: string): Promise<Buffer> {
    const buf = this.files.get(path);
    if (!buf) return Promise.reject(new Error(`File not found: ${path}`));
    return Promise.resolve(buf);
  }

  delete(path: string): Promise<void> {
    this.files.delete(path);
    return Promise.resolve();
  }

  getUrl(path: string): Promise<string> {
    return Promise.resolve(`https://storage.example.com/${path}`);
  }
}

// ─── ContentAnalysis ──────────────────────────────────────────────────────────

export class FakeContentAnalysisService implements IContentAnalysisService {
  private results: ExtractedConcept[] = [];
  private shouldFail = false;

  setResults(results: ExtractedConcept[]) {
    this.results = results;
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  extractConcepts(): Promise<ExtractedConcept[]> {
    if (this.shouldFail)
      return Promise.reject(new Error("Content analysis failed"));
    return Promise.resolve([...this.results]);
  }
}

// ─── DocumentAnalysis ─────────────────────────────────────────────────────────

export class FakeDocumentAnalysisService implements IDocumentAnalysisService {
  private result: DocumentAnalysisResult = {
    overview: "Test overview",
    keyPoints: ["Point 1", "Point 2"],
    topicArea: "Test Topic",
    difficulty: "intermediate",
  };

  setResult(result: DocumentAnalysisResult) {
    this.result = result;
  }

  analyzeDocument(): Promise<DocumentAnalysisResult> {
    return Promise.resolve({ ...this.result });
  }
}

// ─── QuizGeneration ───────────────────────────────────────────────────────────

export class FakeQuizGenerationService implements IQuizGenerationService {
  private results: GeneratedQuestion[] = [];
  private shouldFail = false;

  setResults(results: GeneratedQuestion[]) {
    this.results = results;
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  generateQuiz(): Promise<GeneratedQuestion[]> {
    if (this.shouldFail)
      return Promise.reject(new Error("Quiz generation failed"));
    return Promise.resolve([...this.results]);
  }
}

// ─── ImageTextExtraction ──────────────────────────────────────────────────────

export class FakeImageTextExtractionService implements IImageTextExtractionService {
  private text = "Extracted text from image";

  setText(text: string) {
    this.text = text;
  }

  extractText(): Promise<string> {
    return Promise.resolve(this.text);
  }
}

// ─── TopicConceptGeneration ───────────────────────────────────────────────────

export class FakeTopicConceptGenerationService implements ITopicConceptGenerationService {
  private result: {
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  } = {
    concepts: [],
    relationships: [],
  };

  setResult(result: {
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  }) {
    this.result = result;
  }

  generateConceptsFromTopic(): Promise<{
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  }> {
    return Promise.resolve({
      concepts: [...this.result.concepts],
      relationships: [...this.result.relationships],
    });
  }
}

// ─── RoadmapGeneration ────────────────────────────────────────────────────────

export class FakeRoadmapGenerationService implements IRoadmapGenerationService {
  private result: GeneratedLearningPath = {
    orderedConcepts: [],
    description: "Test roadmap",
    recommendedPace: "1 hour/day",
  };

  setResult(result: GeneratedLearningPath) {
    this.result = result;
  }

  generateLearningPath(): Promise<GeneratedLearningPath> {
    return Promise.resolve({
      ...this.result,
      orderedConcepts: [...this.result.orderedConcepts],
    });
  }
}

// ─── ResourceDiscovery ────────────────────────────────────────────────────────

export class FakeResourceDiscoveryService implements IResourceDiscoveryService {
  private results: DiscoveredResource[] = [];

  setResults(results: DiscoveredResource[]) {
    this.results = results;
  }

  discoverResourcesForConcept(
    _conceptName: string,
    _conceptDescription?: string,
    _options?: ResourceDiscoveryOptions,
  ): Promise<DiscoveredResource[]> {
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

// ─── Cache ────────────────────────────────────────────────────────────────────

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
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
    return Promise.resolve();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  seed(key: string, value: unknown) {
    this.store.set(key, value);
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export class FakeNewsService implements INewsService {
  private articles: Map<string, NewsArticle[]> = new Map();
  private shouldFail = false;

  setArticles(slug: string, articles: NewsArticle[]) {
    this.articles.set(slug, articles);
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  fetchByCategory(slug: string, _name: string): Promise<NewsArticle[]> {
    if (this.shouldFail) return Promise.reject(new Error("News fetch failed"));
    return Promise.resolve(this.articles.get(slug) ?? []);
  }
}

// ─── ConceptRepository ────────────────────────────────────────────────────────

export class FakeConceptRepository implements IConceptRepository {
  private concepts: Concept[] = [];
  private relations: Array<{ fromId: string; toId: string; type: string }> = [];
  private shouldFailSave = false;

  seed(...concepts: Concept[]) {
    this.concepts.push(...concepts);
  }

  setShouldFailSave(fail: boolean) {
    this.shouldFailSave = fail;
  }

  save(concept: Concept): Promise<void> {
    this.concepts = this.concepts.filter((c) => c.id !== concept.id);
    this.concepts.push(concept);
    return Promise.resolve();
  }

  saveWithRelations(
    concepts: Concept[],
    relationships: Array<{ fromId: string; toId: string; type: string }>,
  ): Promise<void> {
    if (this.shouldFailSave)
      return Promise.reject(new Error("Neo4j save failed"));
    for (const c of concepts) {
      this.concepts = this.concepts.filter((x) => x.id !== c.id);
      this.concepts.push(c);
    }
    this.relations.push(...relationships);
    return Promise.resolve();
  }

  findById(id: string): Promise<Concept | null> {
    return Promise.resolve(this.concepts.find((c) => c.id === id) ?? null);
  }

  getGraphByDocumentId(documentId: string): Promise<ConceptGraph> {
    const nodes = this.concepts.filter((c) => c.documentId === documentId);
    return Promise.resolve({ nodes, edges: [] });
  }

  findRelatedConcepts(conceptNames: string[]): Promise<ConceptGraph> {
    const names = new Set(conceptNames.map((n) => n.toLowerCase()));
    const nodes = this.concepts.filter((c) => names.has(c.name.toLowerCase()));
    return Promise.resolve({ nodes, edges: [] });
  }

  addSubConceptRelation(parentId: string, childId: string): Promise<void> {
    this.relations.push({
      fromId: parentId,
      toId: childId,
      type: "HAS_SUBCONCEPT",
    });
    return Promise.resolve();
  }

  findRelatedNotInSet(): Promise<Concept[]> {
    return Promise.resolve([]);
  }

  getSavedConcepts(): Concept[] {
    return [...this.concepts];
  }

  getSavedRelations() {
    return [...this.relations];
  }
}
