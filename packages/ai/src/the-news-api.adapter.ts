import { NewsArticle } from '@sagepoint/domain';
import type { INewsService } from '@sagepoint/domain';

const CATEGORY_SEARCH_MAP: Record<string, string> = {
  'web-development': 'web development | frontend | backend | fullstack',
  'mobile-development': 'mobile development | iOS | Android | React Native',
  'machine-learning': 'machine learning | deep learning | neural network | AI',
  'data-science': 'data science | data analysis | statistics | visualization',
  devops: 'devops | CI/CD | kubernetes | docker | infrastructure',
  cybersecurity:
    'cybersecurity | security | penetration testing | vulnerability',
  'cloud-computing': 'cloud computing | AWS | Azure | GCP | serverless',
  databases: 'database | SQL | NoSQL | PostgreSQL | MongoDB',
  'programming-languages':
    'programming language | Python | JavaScript | Rust | Go',
  'system-design':
    'system design | software architecture | scalability | distributed systems',
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

const DEFAULT_BASE_URL = 'https://api.thenewsapi.com/v1/news/all';

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
      .split('T')[0];

    const params = new URLSearchParams({
      api_token: this.apiKey,
      search,
      language: 'en',
      published_after: publishedAfter,
      limit: '5',
    });

    try {
      const res = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!res.ok) return [];

      const body = (await res.json()) as TheNewsApiResponse;

      return (body.data ?? []).map(
        (a) =>
          new NewsArticle(
            a.title,
            a.description ?? '',
            a.url,
            a.image_url ?? null,
            a.source,
            a.published_at,
            slug,
          ),
      );
    } catch {
      return [];
    }
  }
}
