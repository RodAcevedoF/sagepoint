import { Resource, ResourceType } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

const REQUIRED_PROPS = {
  title: "TypeScript Handbook",
  url: "https://www.typescriptlang.org/docs/",
  type: ResourceType.DOCUMENTATION,
  conceptId: "concept-1",
  roadmapId: "roadmap-1",
  order: 1,
};

describe("Resource", () => {
  describe("constructor", () => {
    it("stores all required props", () => {
      const resource = new Resource({
        ...REQUIRED_PROPS,
        id: "r1",
        createdAt: FIXED_DATE,
      });

      expect(resource.id).toBe("r1");
      expect(resource.title).toBe("TypeScript Handbook");
      expect(resource.url).toBe("https://www.typescriptlang.org/docs/");
      expect(resource.type).toBe(ResourceType.DOCUMENTATION);
      expect(resource.conceptId).toBe("concept-1");
      expect(resource.roadmapId).toBe("roadmap-1");
      expect(resource.order).toBe(1);
      expect(resource.createdAt).toBe(FIXED_DATE);
      expect(resource.description).toBeUndefined();
      expect(resource.provider).toBeUndefined();
      expect(resource.estimatedDuration).toBeUndefined();
      expect(resource.difficulty).toBeUndefined();
    });

    it("stores all optional props", () => {
      const resource = new Resource({
        ...REQUIRED_PROPS,
        id: "r2",
        createdAt: FIXED_DATE,
        description: "Official TS docs",
        provider: "Microsoft",
        estimatedDuration: 120,
        difficulty: "intermediate",
      });

      expect(resource.description).toBe("Official TS docs");
      expect(resource.provider).toBe("Microsoft");
      expect(resource.estimatedDuration).toBe(120);
      expect(resource.difficulty).toBe("intermediate");
    });
  });

  describe("create", () => {
    it("generates a unique id and createdAt", () => {
      const before = Date.now();
      const resource = Resource.create(REQUIRED_PROPS);
      const after = Date.now();

      expect(resource.id).toBeDefined();
      expect(resource.id).toHaveLength(36); // UUID v4
      expect(resource.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(resource.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it("generates distinct ids for two resources", () => {
      const r1 = Resource.create(REQUIRED_PROPS);
      const r2 = Resource.create(REQUIRED_PROPS);

      expect(r1.id).not.toBe(r2.id);
    });
  });
});
