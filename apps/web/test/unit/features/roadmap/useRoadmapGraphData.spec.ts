import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StepStatus } from "@sagepoint/domain";
import type { RoadmapStep } from "@sagepoint/domain";
import { useRoadmapGraphData } from "@/features/roadmap/components/RoadmapGraph/useRoadmapGraphData";

function makeStep(
  overrides: Partial<RoadmapStep> & { id: string; name: string },
): RoadmapStep {
  return {
    concept: {
      id: overrides.id,
      name: overrides.name,
      description: overrides.name,
    },
    order: overrides.order ?? 0,
    dependsOn: overrides.dependsOn ?? [],
    learningObjective: overrides.learningObjective,
    difficulty: overrides.difficulty,
    ...overrides,
  } as RoadmapStep;
}

const STEPS: RoadmapStep[] = [
  makeStep({ id: "c1", name: "HTML", order: 0, dependsOn: [] }),
  makeStep({
    id: "c2",
    name: "CSS",
    order: 1,
    dependsOn: ["c1"],
    difficulty: "beginner",
  }),
  makeStep({
    id: "c3",
    name: "JavaScript",
    order: 2,
    dependsOn: ["c1", "c2"],
    difficulty: "intermediate",
  }),
];

describe("useRoadmapGraphData", () => {
  it("creates a node for each step", () => {
    const { result } = renderHook(() => useRoadmapGraphData(STEPS, {}));

    expect(result.current.nodes).toHaveLength(3);
    expect(result.current.nodes.map((n) => n.data.label)).toEqual([
      "HTML",
      "CSS",
      "JavaScript",
    ]);
  });

  it("creates edges from dependsOn", () => {
    const { result } = renderHook(() => useRoadmapGraphData(STEPS, {}));

    expect(result.current.edges).toHaveLength(3);
    expect(result.current.edges.map((e) => `${e.source}->${e.target}`)).toEqual(
      ["c1->c2", "c1->c3", "c2->c3"],
    );
  });

  it("maps step progress to node status", () => {
    const progress: Record<string, StepStatus> = {
      c1: StepStatus.COMPLETED,
      c2: StepStatus.IN_PROGRESS,
    };

    const { result } = renderHook(() => useRoadmapGraphData(STEPS, progress));

    expect(result.current.nodes[0].data.status).toBe("completed");
    expect(result.current.nodes[1].data.status).toBe("active");
    expect(result.current.nodes[2].data.status).toBe("default");
  });

  it("defaults to 'default' status when no progress exists", () => {
    const { result } = renderHook(() => useRoadmapGraphData(STEPS, {}));

    for (const node of result.current.nodes) {
      expect(node.data.status).toBe("default");
    }
  });

  it("includes difficulty and order in node data", () => {
    const { result } = renderHook(() => useRoadmapGraphData(STEPS, {}));

    expect(result.current.nodes[1].data.difficulty).toBe("beginner");
    expect(result.current.nodes[1].data.order).toBe(1);
    expect(result.current.nodes[2].data.difficulty).toBe("intermediate");
  });

  it("includes learning objective as description", () => {
    const steps = [
      makeStep({
        id: "c1",
        name: "React",
        order: 0,
        learningObjective: "Learn component model",
      }),
    ];

    const { result } = renderHook(() => useRoadmapGraphData(steps, {}));

    expect(result.current.nodes[0].data.description).toBe(
      "Learn component model",
    );
  });

  it("handles steps with no dependencies (root nodes)", () => {
    const steps = [
      makeStep({ id: "c1", name: "A", order: 0 }),
      makeStep({ id: "c2", name: "B", order: 1 }),
    ];

    const { result } = renderHook(() => useRoadmapGraphData(steps, {}));

    expect(result.current.edges).toHaveLength(0);
    expect(result.current.nodes).toHaveLength(2);
  });

  it("sets all edge types to blueprint + dependency", () => {
    const { result } = renderHook(() => useRoadmapGraphData(STEPS, {}));

    for (const edge of result.current.edges) {
      expect(edge.type).toBe("blueprint");
      expect(edge.data?.type).toBe("dependency");
    }
  });

  it("handles skipped status", () => {
    const { result } = renderHook(() =>
      useRoadmapGraphData(STEPS, { c1: StepStatus.SKIPPED }),
    );

    expect(result.current.nodes[0].data.status).toBe("skipped");
  });

  it("returns empty arrays for empty steps", () => {
    const { result } = renderHook(() => useRoadmapGraphData([], {}));

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it("uses dotted notation for sub-concept step order", () => {
    const steps: RoadmapStep[] = [
      makeStep({ id: "c1", name: "React", order: 1, dependsOn: [] }),
      makeStep({ id: "c2", name: "Vue", order: 2, dependsOn: [] }),
      makeStep({
        id: "s1",
        name: "useState",
        order: 3,
        dependsOn: ["c1"],
        rationale: 'Sub-concept of "React"',
      } as Partial<RoadmapStep> & { id: string; name: string }),
      makeStep({
        id: "s2",
        name: "useEffect",
        order: 4,
        dependsOn: ["c1"],
        rationale: 'Sub-concept of "React"',
      } as Partial<RoadmapStep> & { id: string; name: string }),
    ];

    const { result } = renderHook(() => useRoadmapGraphData(steps, {}));

    expect(result.current.nodes[0].data.order).toBe(1);
    expect(result.current.nodes[1].data.order).toBe(2);
    expect(result.current.nodes[2].data.order).toBe("1.1");
    expect(result.current.nodes[3].data.order).toBe("1.2");
  });

  it("keeps numeric order for top-level steps with dependsOn", () => {
    const steps: RoadmapStep[] = [
      makeStep({ id: "c1", name: "HTML", order: 1, dependsOn: [] }),
      makeStep({ id: "c2", name: "CSS", order: 2, dependsOn: ["c1"] }),
    ];

    const { result } = renderHook(() => useRoadmapGraphData(steps, {}));

    expect(result.current.nodes[0].data.order).toBe(1);
    expect(result.current.nodes[1].data.order).toBe(2);
  });
});
