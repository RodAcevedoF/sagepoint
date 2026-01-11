export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string,
    public readonly parentId?: string, // Hierarchical categories
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(id: string, name: string, slug: string, description?: string, parentId?: string): Category {
    return new Category(id, name, slug, description, parentId);
  }
}
