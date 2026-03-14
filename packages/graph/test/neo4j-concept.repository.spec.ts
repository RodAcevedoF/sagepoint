import { Concept } from "@sagepoint/domain";
import { Neo4jConceptRepository } from "../src/neo4j-concept.repository";
import { FakeNeo4jService, mockNode, mockRecord } from "./_fakes/neo4j.fake";
import type { Neo4jService } from "../src/neo4j.service";

describe("Neo4jConceptRepository", () => {
  let fake: FakeNeo4jService;
  let repo: Neo4jConceptRepository;

  beforeEach(() => {
    fake = new FakeNeo4jService();
    repo = new Neo4jConceptRepository(fake as unknown as Neo4jService);
  });

  describe("save()", () => {
    it("should MERGE concept with correct properties", async () => {
      const concept = Concept.create(
        "c-1",
        "TypeScript",
        "doc-1",
        "A typed language",
      );

      await repo.save(concept);

      const writes = fake.getWriteQueries();
      expect(writes).toHaveLength(1);
      expect(writes[0].cypher).toContain("MERGE (c:Concept {id: $id})");
      expect(writes[0].params).toEqual({
        id: "c-1",
        name: "TypeScript",
        description: "A typed language",
        documentId: "doc-1",
      });
    });

    it("should default description and documentId to empty strings", async () => {
      const concept = Concept.create("c-2", "JavaScript");

      await repo.save(concept);

      const writes = fake.getWriteQueries();
      expect(writes[0].params).toEqual(
        expect.objectContaining({
          description: "",
          documentId: "",
        }),
      );
    });
  });

  describe("saveWithRelations()", () => {
    it("should create source node when sourceId provided", async () => {
      const concepts = [Concept.create("c-1", "Node.js", "doc-1")];

      await repo.saveWithRelations(concepts, [], "doc-1", "Document");

      const writes = fake.getWriteQueries();
      const sourceQuery = writes.find((q) =>
        q.cypher.includes("MERGE (s:Document"),
      );
      expect(sourceQuery).toBeDefined();
      expect(sourceQuery.params).toEqual({ id: "doc-1" });
    });

    it("should not create source node when sourceId is not provided", async () => {
      const concepts = [Concept.create("c-1", "Node.js")];

      await repo.saveWithRelations(concepts, []);

      const writes = fake.getWriteQueries();
      const sourceQuery = writes.find((q) => q.cypher.includes("MERGE (s:"));
      expect(sourceQuery).toBeUndefined();
    });

    it("should MERGE all concepts", async () => {
      const concepts = [
        Concept.create("c-1", "React", "doc-1", "UI library"),
        Concept.create("c-2", "Vue", "doc-1", "Another UI library"),
      ];

      await repo.saveWithRelations(concepts, [], "doc-1", "Document");

      const writes = fake.getWriteQueries();
      const conceptMerges = writes.filter((q) =>
        q.cypher.includes("MERGE (c:Concept {id: $id})"),
      );
      expect(conceptMerges).toHaveLength(2);
      expect(conceptMerges[0].params).toEqual(
        expect.objectContaining({ id: "c-1", name: "React" }),
      );
      expect(conceptMerges[1].params).toEqual(
        expect.objectContaining({ id: "c-2", name: "Vue" }),
      );
    });

    it("should create CONTAINS links to source", async () => {
      const concepts = [Concept.create("c-1", "GraphQL", "doc-1")];

      await repo.saveWithRelations(concepts, [], "doc-1", "Document");

      const writes = fake.getWriteQueries();
      const containsQuery = writes.find((q) =>
        q.cypher.includes("MERGE (s)-[:CONTAINS]->(c)"),
      );
      expect(containsQuery).toBeDefined();
      expect(containsQuery.params).toEqual({
        sourceId: "doc-1",
        conceptId: "c-1",
      });
    });

    it("should create relationships with sanitized types", async () => {
      const concepts = [Concept.create("c-1", "A"), Concept.create("c-2", "B")];
      const relationships = [
        { fromId: "c-1", toId: "c-2", type: "depends-on" },
      ];

      await repo.saveWithRelations(concepts, relationships);

      const writes = fake.getWriteQueries();
      const relQuery = writes.find((q) => q.cypher.includes("DEPENDS_ON"));
      expect(relQuery).toBeDefined();
      expect(relQuery.params).toEqual({ fromId: "c-1", toId: "c-2" });
    });

    it("should handle empty concepts array", async () => {
      await repo.saveWithRelations([], []);

      const writes = fake.getWriteQueries();
      const conceptMerges = writes.filter((q) =>
        q.cypher.includes("MERGE (c:Concept"),
      );
      expect(conceptMerges).toHaveLength(0);
    });
  });

  describe("findById()", () => {
    it("should return Concept when found", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({
            id: "c-1",
            name: "TypeScript",
            documentId: "doc-1",
            description: "A typed language",
          }),
        }),
      ]);

      const result = await repo.findById("c-1");

      expect(result).toBeInstanceOf(Concept);
      const c = result;
      expect(c.id).toBe("c-1");
      expect(c.name).toBe("TypeScript");
      expect(c.documentId).toBe("doc-1");
      expect(c.description).toBe("A typed language");

      const reads = fake.getReadQueries();
      expect(reads).toHaveLength(1);
      expect(reads[0].params).toEqual({ id: "c-1" });
    });

    it("should return null when not found", async () => {
      fake.setReadResult([]);

      const result = await repo.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getGraphByDocumentId()", () => {
    it("should return nodes and edges", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({
            id: "c-1",
            name: "A",
            documentId: "doc-1",
            description: "",
          }),
        }),
        mockRecord({
          c: mockNode({
            id: "c-2",
            name: "B",
            documentId: "doc-1",
            description: "",
          }),
        }),
      ]);
      fake.setReadResult([
        mockRecord({ from: "c-1", to: "c-2", type: "DEPENDS_ON" }),
      ]);

      const graph = await repo.getGraphByDocumentId("doc-1");

      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes[0]).toBeInstanceOf(Concept);
      expect(graph.nodes[0].id).toBe("c-1");
      expect(graph.nodes[1].id).toBe("c-2");

      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0]).toEqual({
        from: "c-1",
        to: "c-2",
        type: "DEPENDS_ON",
      });

      const reads = fake.getReadQueries();
      expect(reads).toHaveLength(2);
      expect(reads[0].cypher).toContain("Concept {documentId: $documentId}");
      expect(reads[1].cypher).toContain("type(r) <> 'SAME_AS'");
    });

    it("should return empty graph for unknown document", async () => {
      fake.setReadResult([]);
      fake.setReadResult([]);

      const graph = await repo.getGraphByDocumentId("unknown");

      expect(graph.nodes).toHaveLength(0);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe("findRelatedConcepts()", () => {
    it("should return empty graph for empty input", async () => {
      const graph = await repo.findRelatedConcepts([]);

      expect(graph).toEqual({ nodes: [], edges: [] });
      expect(fake.queries).toHaveLength(0);
    });

    it("should search by concept names with fuzzy matching", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({
            id: "c-1",
            name: "TypeScript",
            documentId: "doc-1",
            description: "",
          }),
        }),
      ]);
      fake.setReadResult([]);

      const graph = await repo.findRelatedConcepts(["typescript"]);

      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].name).toBe("TypeScript");

      const reads = fake.getReadQueries();
      expect(reads[0].cypher).toContain("toLower(c.name) CONTAINS term");
      expect(reads[0].params).toEqual(
        expect.objectContaining({ names: ["typescript"] }),
      );
    });

    it("should use default limit of 20", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({ id: "c-1", name: "A", description: "" }),
        }),
      ]);
      fake.setReadResult([]);

      await repo.findRelatedConcepts(["a"]);

      const reads = fake.getReadQueries();
      expect(reads[0].params).toEqual(expect.objectContaining({ limit: 20 }));
    });

    it("should return empty graph when no matches found", async () => {
      fake.setReadResult([]);

      const graph = await repo.findRelatedConcepts(["nonexistent"]);

      expect(graph).toEqual({ nodes: [], edges: [] });
    });

    it("should fetch edges between found nodes", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({ id: "c-1", name: "React", description: "" }),
        }),
        mockRecord({
          c: mockNode({ id: "c-2", name: "React Native", description: "" }),
        }),
      ]);
      fake.setReadResult([
        mockRecord({ from: "c-1", to: "c-2", type: "RELATED_TO" }),
      ]);

      const graph = await repo.findRelatedConcepts(["react"]);

      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0]).toEqual({
        from: "c-1",
        to: "c-2",
        type: "RELATED_TO",
      });

      const reads = fake.getReadQueries();
      expect(reads[1].params).toEqual(
        expect.objectContaining({ ids: ["c-1", "c-2"] }),
      );
    });
  });

  describe("addSubConceptRelation()", () => {
    it("should create HAS_SUBCONCEPT edge", async () => {
      await repo.addSubConceptRelation("parent-1", "child-1");

      const writes = fake.getWriteQueries();
      expect(writes).toHaveLength(1);
      expect(writes[0].cypher).toContain("HAS_SUBCONCEPT");
      expect(writes[0].params).toEqual({
        parentId: "parent-1",
        childId: "child-1",
      });
    });
  });

  describe("findRelatedNotInSet()", () => {
    it("should find related concepts not in input set", async () => {
      fake.setReadResult([
        mockRecord({
          c: mockNode({
            id: "c-3",
            name: "Docker",
            documentId: "doc-2",
            description: "Containers",
          }),
        }),
      ]);

      const result = await repo.findRelatedNotInSet(["c-1", "c-2"]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Concept);
      expect(result[0].id).toBe("c-3");
      expect(result[0].name).toBe("Docker");

      const reads = fake.getReadQueries();
      expect(reads).toHaveLength(1);
      expect(reads[0].cypher).toContain("RELATED_TO|DEPENDS_ON");
      expect(reads[0].cypher).toContain("NOT n.id IN $ids");
      expect(reads[0].params).toEqual({ ids: ["c-1", "c-2"] });
    });

    it("should return empty array when no related concepts found", async () => {
      fake.setReadResult([]);

      const result = await repo.findRelatedNotInSet(["c-1"]);

      expect(result).toHaveLength(0);
    });
  });
});
