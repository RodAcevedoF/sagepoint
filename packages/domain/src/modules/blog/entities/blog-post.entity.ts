export enum BlogPostSource {
  STATIC = "STATIC",
  GENERATED = "GENERATED",
}

export interface BlogPostSourceRef {
  title: string;
  url: string;
  source: string;
}

export class BlogPost {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly excerpt: string,
    public readonly contentMarkdown: string,
    public readonly heroImageUrl: string | null,
    public readonly categoryId: string,
    public readonly categorySlug: string,
    public readonly author: string,
    public readonly source: BlogPostSource,
    public readonly sources: BlogPostSourceRef[],
    public readonly publishedAt: Date,
    public readonly createdAt: Date,
  ) {}
}
