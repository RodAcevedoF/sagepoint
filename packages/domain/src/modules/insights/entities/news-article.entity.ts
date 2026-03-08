export class NewsArticle {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly url: string,
    public readonly imageUrl: string | null,
    public readonly source: string,
    public readonly publishedAt: string,
    public readonly categorySlug: string,
  ) {}
}
