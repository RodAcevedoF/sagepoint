const mockSession = {
  run: jest.fn().mockResolvedValue({ records: [] }),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockDriver = {
  session: jest.fn().mockReturnValue(mockSession),
  close: jest.fn().mockResolvedValue(undefined),
  getServerInfo: jest.fn().mockResolvedValue({ agent: "Neo4j/5.0.0" }),
};

const mockNeo4jDefault = {
  driver: jest.fn().mockReturnValue(mockDriver),
  auth: { basic: jest.fn().mockReturnValue({}) },
  session: { READ: "READ", WRITE: "WRITE" },
};

jest.mock("neo4j-driver", () => ({
  __esModule: true,
  default: mockNeo4jDefault,
}));

import { Neo4jService } from "../src/neo4j.service";

describe("Neo4jService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create driver with direct config", () => {
      const _service = new Neo4jService({
        uri: "bolt://custom:7687",
        user: "admin",
        pass: "secret",
        encrypted: "ENCRYPTION_OFF",
      });

      expect(mockNeo4jDefault.driver).toHaveBeenCalledWith(
        "bolt://custom:7687",
        expect.anything(),
        expect.objectContaining({ encrypted: false }),
      );
    });

    it("should create driver with defaults when no config provided", () => {
      const _service = new Neo4jService();

      expect(mockNeo4jDefault.driver).toHaveBeenCalledWith(
        "bolt://localhost:7687",
        expect.anything(),
        expect.objectContaining({ encrypted: false }),
      );
    });
  });

  describe("getDriver()", () => {
    it("should return the neo4j driver instance", () => {
      const service = new Neo4jService();
      expect(service.getDriver()).toBe(mockDriver);
    });
  });

  describe("onApplicationShutdown()", () => {
    it("should close the driver", async () => {
      const service = new Neo4jService();
      await service.onApplicationShutdown();
      expect(mockDriver.close).toHaveBeenCalled();
    });
  });

  describe("read()", () => {
    it("should open a READ session, run query, and close session", async () => {
      const service = new Neo4jService();
      const expectedResult = { records: [{ id: "1" }] };
      mockSession.run.mockResolvedValueOnce(expectedResult);

      const result = await service.read("MATCH (n) RETURN n", { id: "1" });

      expect(mockDriver.session).toHaveBeenCalledWith({
        defaultAccessMode: "READ",
      });
      expect(mockSession.run).toHaveBeenCalledWith("MATCH (n) RETURN n", {
        id: "1",
      });
      expect(mockSession.close).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });

    it("should close session even if query throws", async () => {
      const service = new Neo4jService();
      mockSession.run.mockRejectedValueOnce(new Error("query failed"));

      await expect(service.read("BAD CYPHER")).rejects.toThrow("query failed");
      expect(mockSession.close).toHaveBeenCalled();
    });

    it("should use empty params by default", async () => {
      const service = new Neo4jService();
      await service.read("MATCH (n) RETURN n");
      expect(mockSession.run).toHaveBeenCalledWith("MATCH (n) RETURN n", {});
    });
  });

  describe("write()", () => {
    it("should open a WRITE session, run query, and close session", async () => {
      const service = new Neo4jService();
      await service.write("CREATE (n:Test)", { name: "test" });

      expect(mockDriver.session).toHaveBeenCalledWith({
        defaultAccessMode: "WRITE",
      });
      expect(mockSession.run).toHaveBeenCalledWith("CREATE (n:Test)", {
        name: "test",
      });
      expect(mockSession.close).toHaveBeenCalled();
    });

    it("should close session even if write throws", async () => {
      const service = new Neo4jService();
      mockSession.run.mockRejectedValueOnce(new Error("write failed"));

      await expect(service.write("BAD CYPHER")).rejects.toThrow("write failed");
      expect(mockSession.close).toHaveBeenCalled();
    });
  });
});
