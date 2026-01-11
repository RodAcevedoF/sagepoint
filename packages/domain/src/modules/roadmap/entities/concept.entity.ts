export class Concept {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly documentId: string,
    public readonly description?: string,
    // Relationships can be represented as IDs or enriched objects depending on aggregate design
    // For a Graph-heavy domain, we might keep it simple or strictly anemic.
  ) {}

  static create(id: string, name: string, documentId: string, description?: string): Concept {
    return new Concept(id, name, documentId, description);
  }
}
