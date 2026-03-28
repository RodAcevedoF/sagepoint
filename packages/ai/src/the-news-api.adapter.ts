import { NewsArticle } from "@sagepoint/domain";
import type { INewsService } from "@sagepoint/domain";

const CATEGORY_SEARCH_MAP: Record<string, string> = {
  "web-development":
    '"web development" | "frontend development" | "backend development"',
  "mobile-development":
    '"mobile development" | "mobile app" | "React Native" | Flutter',
  "machine-learning":
    '"machine learning" | "deep learning" | "neural network" | "large language model"',
  "data-science": '"data science" | "data analysis" | "data engineering"',
  devops: 'devops | "CI/CD" | kubernetes | "docker container"',
  cybersecurity:
    'cybersecurity | "penetration testing" | vulnerability | "zero-day"',
  "cloud-computing":
    '"cloud computing" | serverless | "cloud infrastructure" | "cloud-native"',
  databases: 'database | PostgreSQL | MongoDB | "SQL query" | NoSQL',
  "programming-languages":
    '"programming language" | "Python programming" | JavaScript | "Rust lang"',
  "system-design":
    '"system design" | "software architecture" | "distributed systems" | scalability',
};

interface TheNewsApiArticle {
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  source: string;
  published_at: string;
}

interface TheNewsApiResponse {
  data: TheNewsApiArticle[];
}

export interface TheNewsApiConfig {
  apiKey: string;
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "https://api.thenewsapi.com/v1/news/all";

export class TheNewsApiAdapter implements INewsService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: TheNewsApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  async fetchByCategory(slug: string, name: string): Promise<NewsArticle[]> {
    const search = CATEGORY_SEARCH_MAP[slug] ?? name;
    const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams({
      api_token: this.apiKey,
      search,
      language: "en",
      published_after: publishedAfter,
      limit: "5",
    });

    try {
      const res = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!res.ok) {
        console.warn(
          `[TheNewsAPI] ${res.status} for slug="${slug}": ${await res.text()}`,
        );
        return [];
      }

      const body = (await res.json()) as TheNewsApiResponse;

      return (body.data ?? []).map(
        (a) =>
          new NewsArticle(
            "",
            a.title,
            a.description ?? "",
            a.url,
            a.image_url ?? null,
            a.source,
            new Date(a.published_at),
            "",
            slug,
          ),
      );
    } catch (error) {
      console.error(`[TheNewsAPI] Failed for slug="${slug}":`, error);
      return [];
    }
  }
}
