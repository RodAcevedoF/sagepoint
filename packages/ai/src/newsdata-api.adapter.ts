import { NewsArticle } from "@sagepoint/domain";
import type { INewsService } from "@sagepoint/domain";

const CATEGORY_SEARCH_MAP: Record<
  string,
  { query: string; keywords: string[] }
> = {
  "web-development": {
    query:
      '"web development" OR "frontend development" OR "backend development" OR "fullstack developer"',
    keywords: [
      "web",
      "frontend",
      "backend",
      "fullstack",
      "html",
      "css",
      "react",
      "angular",
      "vue",
      "node",
      "api",
    ],
  },
  "mobile-development": {
    query:
      '"mobile development" OR "mobile app" OR "React Native" OR "Flutter" OR "Swift" OR "Kotlin"',
    keywords: [
      "mobile",
      "ios",
      "android",
      "react native",
      "flutter",
      "swift",
      "kotlin",
      "app development",
    ],
  },
  "machine-learning": {
    query:
      '"machine learning" OR "deep learning" OR "neural network" OR "large language model"',
    keywords: [
      "machine learning",
      "deep learning",
      "neural",
      "model",
      "training",
      "llm",
      "nlp",
      "computer vision",
      "pytorch",
      "tensorflow",
    ],
  },
  "data-science": {
    query:
      '"data science" OR "data analysis" OR "data engineering" OR "data visualization"',
    keywords: [
      "data science",
      "data analysis",
      "analytics",
      "visualization",
      "pandas",
      "statistics",
      "dataset",
    ],
  },
  devops: {
    query:
      '"devops" OR "CI/CD" OR "kubernetes" OR "docker container" OR "infrastructure as code"',
    keywords: [
      "devops",
      "ci/cd",
      "kubernetes",
      "docker",
      "terraform",
      "jenkins",
      "pipeline",
      "deployment",
      "infrastructure",
    ],
  },
  cybersecurity: {
    query:
      '"cybersecurity" OR "penetration testing" OR "vulnerability" OR "security breach" OR "zero-day"',
    keywords: [
      "security",
      "cyber",
      "vulnerability",
      "exploit",
      "breach",
      "malware",
      "encryption",
      "pentest",
      "threat",
    ],
  },
  "cloud-computing": {
    query:
      '"cloud computing" OR "serverless" OR "cloud infrastructure" OR "cloud-native"',
    keywords: [
      "cloud",
      "serverless",
      "aws",
      "azure",
      "gcp",
      "saas",
      "paas",
      "microservice",
      "cloud-native",
    ],
  },
  databases: {
    query: '"database" OR "PostgreSQL" OR "MongoDB" OR "SQL query" OR "NoSQL"',
    keywords: [
      "database",
      "sql",
      "nosql",
      "postgresql",
      "mongodb",
      "redis",
      "query",
      "schema",
      "index",
    ],
  },
  "programming-languages": {
    query:
      '"programming language" OR "Python programming" OR "JavaScript" OR "Rust lang" OR "Go programming"',
    keywords: [
      "programming",
      "language",
      "python",
      "javascript",
      "typescript",
      "rust",
      "golang",
      "compiler",
      "syntax",
    ],
  },
  "system-design": {
    query:
      '"system design" OR "software architecture" OR "distributed systems" OR "scalability"',
    keywords: [
      "system design",
      "architecture",
      "distributed",
      "scalability",
      "microservice",
      "load balancing",
      "caching",
    ],
  },
};

interface NewsdataArticle {
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  source_name: string;
  pubDate: string;
  ai_summary: string | null;
  duplicate: boolean;
}

interface NewsdataResponse {
  status: string;
  totalResults: number;
  results: NewsdataArticle[];
}

export interface NewsdataApiConfig {
  apiKey: string;
}

const BASE_URL = "https://newsdata.io/api/1/latest";
const PAID_ONLY = "ONLY AVAILABLE IN PAID PLANS";

function isUsable(text: string | null): text is string {
  return !!text && !text.includes(PAID_ONLY);
}

function pickDescription(
  aiSummary: string | null,
  description: string | null,
): string {
  if (isUsable(aiSummary)) return aiSummary;
  if (isUsable(description)) return description;
  return "";
}

function isRelevant(title: string, keywords: string[]): boolean {
  const lower = title.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export class NewsdataApiAdapter implements INewsService {
  private readonly apiKey: string;

  constructor(config: NewsdataApiConfig) {
    this.apiKey = config.apiKey;
  }

  async fetchByCategory(slug: string, name: string): Promise<NewsArticle[]> {
    const mapping = CATEGORY_SEARCH_MAP[slug];
    const search = mapping?.query ?? name;
    const keywords = mapping?.keywords ?? [name.toLowerCase()];

    const params = new URLSearchParams({
      apikey: this.apiKey,
      q: search,
      language: "en",
      category: "technology,science",
      size: "10",
      removeduplicate: "1",
      prioritydomain: "top",
    });

    try {
      const res = await fetch(`${BASE_URL}?${params.toString()}`);

      if (!res.ok) {
        console.warn(
          `[NewsdataIO] ${res.status} for slug="${slug}": ${await res.text()}`,
        );
        return [];
      }

      const body = (await res.json()) as NewsdataResponse;

      if (body.status !== "success" || !body.results) return [];

      return body.results
        .filter((a) => a.title && a.link && isRelevant(a.title, keywords))
        .slice(0, 5)
        .map(
          (a) =>
            new NewsArticle(
              "", // id assigned by worker on persist
              a.title,
              pickDescription(a.ai_summary, a.description),
              a.link,
              a.image_url ?? null,
              a.source_name,
              new Date(a.pubDate),
              "", // categoryId assigned by worker
              slug,
            ),
        );
    } catch (error) {
      console.error(`[NewsdataIO] Failed for slug="${slug}":`, error);
      return [];
    }
  }
}
