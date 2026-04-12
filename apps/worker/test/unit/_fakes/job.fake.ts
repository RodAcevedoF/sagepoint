export class FakeJob<T = unknown> {
  public progressUpdates: unknown[] = [];

  constructor(
    public readonly id: string,
    public readonly data: T,
    public readonly name: string = "process-document",
  ) {}

  updateProgress(value: unknown): Promise<void> {
    this.progressUpdates.push(value);
    return Promise.resolve();
  }

  get lastProgress(): unknown {
    return this.progressUpdates[this.progressUpdates.length - 1];
  }
}
