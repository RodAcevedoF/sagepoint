export class NewsArticle {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly url: string,
    public readonly imageUrl: string | null,
    public readonly source: string,
    public readonly publishedAt: Date,
    public readonly categoryId: string,
    public readonly categorySlug: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
