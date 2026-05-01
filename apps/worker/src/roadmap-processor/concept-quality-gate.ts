import type {
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  ConceptEmbedding,
} from "@sagepoint/domain";
import { cosine, normalizeName } from "../utils/worker.roadmap.util";
import {
  QualityGateDeps,
  QualityGateInput,
  QualityGateResult,
} from "./contracts";

export async function applyQualityGate(
  input: QualityGateInput,
  deps: QualityGateDeps,
): Promise<QualityGateResult> {
  const { concepts, relationships } = input;
  const { embedder, similarityThreshold = 0.95 } = deps;
  const dropped: QualityGateResult["dropped"] = [];

  // Step 1: Normalized name dedup — first occurrence wins
  const mergeMap = new Map<string, string>(); // droppedId -> keptId
  const nameToKeptId = new Map<string, string>();
  let survivors: ConceptForOrdering[] = [];

  for (const concept of concepts) {
    const key = normalizeName(concept.name);
    const keptId = nameToKeptId.get(key);
    if (keptId !== undefined) {
      mergeMap.set(concept.id, keptId);
      dropped.push({ id: concept.id, reason: "name-dup" });
    } else {
      nameToKeptId.set(key, concept.id);
      survivors.push(concept);
    }
  }

  // Step 2: Embedding dedup on survivors
  let survivorEmbeddings: number[][] = [];
  if (survivors.length > 0) {
    survivorEmbeddings = await embedder.embed(
      survivors.map((c) => `${c.name}: ${c.description ?? ""}`),
    );

    const deduped: ConceptForOrdering[] = [];
    const dedupedEmbeddings: number[][] = [];
    const dropped_flags = new Array<boolean>(survivors.length).fill(false);

    for (let i = 0; i < survivors.length; i++) {
      if (dropped_flags[i]) continue;
      deduped.push(survivors[i]);
      dedupedEmbeddings.push(survivorEmbeddings[i]);
      for (let j = i + 1; j < survivors.length; j++) {
        if (dropped_flags[j]) continue;
        const sim = cosine(survivorEmbeddings[i], survivorEmbeddings[j]);
        if (sim >= similarityThreshold) {
          console.warn(
            `[quality-gate] embedding-dup: "${survivors[j].name}" ~ "${survivors[i].name}" (sim=${sim.toFixed(3)})`,
          );
          mergeMap.set(survivors[j].id, survivors[i].id);
          dropped.push({ id: survivors[j].id, reason: "embedding-dup" });
          dropped_flags[j] = true;
        }
      }
    }

    survivors = deduped;
    survivorEmbeddings = dedupedEmbeddings;
  }

  // Step 3: Rewrite relationships — resolve merged ids, drop self-loops and duplicates
  const survivorIds = new Set(survivors.map((c) => c.id));
  const resolve = (id: string): string => mergeMap.get(id) ?? id;
  const seenEdges = new Set<string>();
  const rewrittenRels: ConceptRelationshipForOrdering[] = [];

  for (const rel of relationships) {
    const from = resolve(rel.fromId);
    const to = resolve(rel.toId);
    if (from === to) continue;
    if (!survivorIds.has(from) || !survivorIds.has(to)) continue;
    const edgeKey = `${from}|${to}|${rel.type}`;
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    rewrittenRels.push({ fromId: from, toId: to, type: rel.type });
  }

  if (survivors.length === 0) {
    return { concepts: [], relationships: [], embeddings: [], dropped };
  }

  // Step 4: Connected components — keep the largest
  const adj = new Map<string, Set<string>>();
  for (const c of survivors) adj.set(c.id, new Set());
  for (const rel of rewrittenRels) {
    adj.get(rel.fromId)?.add(rel.toId);
    adj.get(rel.toId)?.add(rel.fromId);
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  for (const c of survivors) {
    if (visited.has(c.id)) continue;
    const component: string[] = [];
    const queue = [c.id];
    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node)) continue;
      visited.add(node);
      component.push(node);
      for (const neighbor of adj.get(node) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    components.push(component);
  }

  let largest = components[0];
  for (const comp of components) {
    if (comp.length > largest.length) largest = comp;
  }
  const keptIds = new Set(largest);

  for (const c of survivors) {
    if (!keptIds.has(c.id)) {
      dropped.push({ id: c.id, reason: "disconnected" });
    }
  }

  const finalConcepts = survivors.filter((c) => keptIds.has(c.id));
  const finalRels = rewrittenRels.filter(
    (r) => keptIds.has(r.fromId) && keptIds.has(r.toId),
  );

  const idToEmbIdx = new Map<string, number>();
  for (let i = 0; i < survivors.length; i++) {
    idToEmbIdx.set(survivors[i].id, i);
  }
  const embeddings: ConceptEmbedding[] = finalConcepts
    .filter((c) => idToEmbIdx.has(c.id))
    .map((c) => ({
      conceptId: c.id,
      embedding: survivorEmbeddings[idToEmbIdx.get(c.id)!],
    }));

  return {
    concepts: finalConcepts,
    relationships: finalRels,
    embeddings,
    dropped,
  };
}
