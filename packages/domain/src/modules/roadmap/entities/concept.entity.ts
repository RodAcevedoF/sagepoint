export class Concept {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly documentId?: string,
    public readonly description?: string,
  ) {}

  static create(id: string, name: string, documentId?: string, description?: string): Concept {
    return new Concept(id, name, documentId, description);
  }
}
