import { applyQualityGate } from "../../../src/roadmap-processor/concept-quality-gate";
import { FakeEmbeddingService } from "../_fakes/services.fake";
import type {
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
} from "@sagepoint/domain";

const C = (
  id: string,
  name: string,
  description?: string,
): ConceptForOrdering => ({
  id,
  name,
  description,
});

const R = (
  fromId: string,
  toId: string,
  type: "DEPENDS_ON" | "RELATED_TO" | "NEXT_STEP" = "RELATED_TO",
): ConceptRelationshipForOrdering => ({ fromId, toId, type });

describe("applyQualityGate", () => {
  let embedder: FakeEmbeddingService;

  beforeEach(() => {
    embedder = new FakeEmbeddingService();
  });

  describe("name dedup", () => {
    it("drops exact-same names (case-insensitive)", async () => {
      const concepts = [C("c1", "Neural Networks"), C("c2", "neural networks")];
      const result = await applyQualityGate(
        { concepts, relationships: [] },
        { embedder },
      );
      expect(result.concepts).toHaveLength(1);
      expect(result.concepts[0].id).toBe("c1");
      expect(result.dropped).toEqual([{ id: "c2", reason: "name-dup" }]);
    });

    it("rewrites relationships from dropped name-dup id to kept id", async () => {
      const concepts = [
        C("c1", "React Hooks"),
        C("c2", "react hooks"),
        C("c3", "State"),
      ];
      const relationships = [R("c2", "c3")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      // c2 is merged into c1; edge c2->c3 becomes c1->c3
      const rel = result.relationships.find((r) => r.toId === "c3");
      expect(rel?.fromId).toBe("c1");
    });

    it("drops self-loops created by merging", async () => {
      const concepts = [C("c1", "JS"), C("c2", "js")];
      const relationships = [R("c1", "c2")]; // would become c1->c1 after merge
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      expect(result.relationships).toHaveLength(0);
    });
  });

  describe("embedding dedup", () => {
    it("drops concept when cosine similarity >= threshold", async () => {
      // Set identical vectors → similarity = 1.0
      embedder.setVectors([
        [1, 0, 0],
        [1, 0, 0], // identical to c1
        [0, 1, 0],
      ]);
      const concepts = [C("c1", "React"), C("c2", "ReactJS"), C("c3", "State")];
      const relationships = [R("c1", "c3"), R("c2", "c3")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder, similarityThreshold: 0.9 },
      );
      expect(result.dropped.find((d) => d.id === "c2")?.reason).toBe(
        "embedding-dup",
      );
      expect(result.concepts.find((c) => c.id === "c2")).toBeUndefined();
    });

    it("keeps concepts below the similarity threshold", async () => {
      embedder.setVectors([
        [1, 0, 0],
        [0, 1, 0], // orthogonal → similarity = 0
        [0, 0, 1],
      ]);
      const concepts = [C("c1", "A"), C("c2", "B"), C("c3", "C")];
      const relationships = [R("c1", "c2"), R("c2", "c3")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder, similarityThreshold: 0.9 },
      );
      expect(result.concepts).toHaveLength(3);
      expect(result.dropped).toHaveLength(0);
    });
  });

  describe("connected components", () => {
    it("keeps the largest connected component", async () => {
      // Use distinct vectors so no embedding dedup fires (5 concepts, 3 dims — cycles without setVectors)
      embedder.setVectors([
        [1, 0, 0], // c1
        [0, 1, 0], // c2
        [0, 0, 1], // c3
        [1, 1, 0], // c4 — cosine with c1 ≈ 0.71, no dedup
        [0, 1, 1], // c5 — cosine with c2 ≈ 0.71, no dedup
      ]);
      // c1-c2-c3 connected; c4-c5 separate smaller cluster
      const concepts = [
        C("c1", "A"),
        C("c2", "B"),
        C("c3", "C"),
        C("c4", "D"),
        C("c5", "E"),
      ];
      const relationships = [R("c1", "c2"), R("c2", "c3"), R("c4", "c5")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      expect(result.concepts.map((c) => c.id).sort()).toEqual([
        "c1",
        "c2",
        "c3",
      ]);
      expect(
        result.dropped.filter((d) => d.reason === "disconnected"),
      ).toHaveLength(2);
    });

    it("treats all relationships as undirected for component detection", async () => {
      // c1 -> c2 (directed); c2 should still be reachable from c1
      const concepts = [C("c1", "A"), C("c2", "B"), C("c3", "C")];
      const relationships = [R("c1", "c2"), R("c3", "c2", "DEPENDS_ON")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      // All in one component
      expect(result.concepts).toHaveLength(3);
    });

    it("handles fully isolated concepts — keeps largest component (size 1 tie: keeps first)", async () => {
      const concepts = [C("c1", "A"), C("c2", "B")];
      const result = await applyQualityGate(
        { concepts, relationships: [] },
        { embedder },
      );
      // Two isolated components of size 1; ties go to first in order → c1 kept
      expect(result.concepts).toHaveLength(1);
      expect(result.concepts[0].id).toBe("c1");
      expect(result.dropped.find((d) => d.reason === "disconnected")?.id).toBe(
        "c2",
      );
    });
  });

  describe("embeddings output", () => {
    it("returns embeddings aligned with surviving concepts", async () => {
      embedder.setVectors([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]);
      const concepts = [C("c1", "A"), C("c2", "B"), C("c3", "C")];
      const relationships = [R("c1", "c2"), R("c2", "c3")];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      expect(result.embeddings).toHaveLength(result.concepts.length);
      for (const emb of result.embeddings) {
        expect(
          result.concepts.find((c) => c.id === emb.conceptId),
        ).toBeDefined();
        expect(emb.embedding).toHaveLength(3);
      }
    });
  });

  describe("edge cases", () => {
    it("returns empty result for empty input", async () => {
      const result = await applyQualityGate(
        { concepts: [], relationships: [] },
        { embedder },
      );
      expect(result.concepts).toHaveLength(0);
      expect(result.relationships).toHaveLength(0);
      expect(result.embeddings).toHaveLength(0);
    });

    it("deduplicates parallel edges", async () => {
      const concepts = [C("c1", "A"), C("c2", "B")];
      const relationships = [
        R("c1", "c2", "RELATED_TO"),
        R("c1", "c2", "RELATED_TO"), // duplicate
      ];
      const result = await applyQualityGate(
        { concepts, relationships },
        { embedder },
      );
      expect(result.relationships).toHaveLength(1);
    });
  });
});
