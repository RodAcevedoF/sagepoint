export interface RecordedQuery {
  cypher: string;
  params?: Record<string, unknown>;
  mode: "read" | "write";
}

export function mockNode(properties: Record<string, unknown>) {
  return { properties };
}

export function mockRecord(data: Record<string, unknown>) {
  return {
    get: (key: string) => data[key],
    keys: Object.keys(data),
  };
}

export class FakeNeo4jService {
  public queries: RecordedQuery[] = [];
  private readResults: unknown[][] = [];
  private writeResults: unknown[][] = [];

  /** Enqueue a set of records to be returned by the next read() call. */
  setReadResult(records: unknown[]): void {
    this.readResults.push(records);
  }

  /** Enqueue a set of records to be returned by the next write() call. */
  setWriteResult(records: unknown[]): void {
    this.writeResults.push(records);
  }

  read(
    cypher: string,
    params?: Record<string, unknown>,
  ): Promise<{ records: unknown[] }> {
    this.queries.push({ cypher, params, mode: "read" });
    const records = this.readResults.shift() ?? [];
    return Promise.resolve({ records });
  }

  write(
    cypher: string,
    params?: Record<string, unknown>,
  ): Promise<{ records: unknown[] }> {
    this.queries.push({ cypher, params, mode: "write" });
    const records = this.writeResults.shift() ?? [];
    return Promise.resolve({ records });
  }

  getDriver() {
    const sessionQueries = this.queries;
    const writeResults = this.writeResults;
    const fakeSession = {
      run: jest
        .fn()
        .mockImplementation(
          (cypher: string, params?: Record<string, unknown>) => {
            sessionQueries.push({ cypher, params, mode: "write" });
            const records = writeResults.shift() ?? [];
            return Promise.resolve({ records });
          },
        ),
      close: jest.fn().mockResolvedValue(undefined),
    };
    return {
      session: jest.fn().mockReturnValue(fakeSession),
      close: jest.fn().mockResolvedValue(undefined),
    };
  }

  onApplicationShutdown(): Promise<void> {
    return Promise.resolve();
  }

  /** Helper: get only read queries. */
  getReadQueries(): RecordedQuery[] {
    return this.queries.filter((q) => q.mode === "read");
  }

  /** Helper: get only write queries. */
  getWriteQueries(): RecordedQuery[] {
    return this.queries.filter((q) => q.mode === "write");
  }

  /** Reset all recorded queries and results. */
  reset(): void {
    this.queries = [];
    this.readResults = [];
    this.writeResults = [];
  }
}
