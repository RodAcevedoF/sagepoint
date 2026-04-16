import { tavily } from "@tavily/core";
import { Logger } from "@nestjs/common";
import { NewsArticle } from "@sagepoint/domain";
import type { INewsService } from "@sagepoint/domain";

const CATEGORY_SEARCH_MAP: Record<string, { query: string }> = {
  "web-development": {
    query: "web development frontend backend fullstack",
  },
  "mobile-development": {
    query: "mobile app development React Native Flutter Swift Kotlin",
  },
  "machine-learning": {
    query: "machine learning deep learning neural network large language model",
  },
  "data-science": {
    query: "data science data analysis data engineering visualization",
  },
  devops: {
    query: "devops CI/CD kubernetes docker infrastructure as code",
  },
  cybersecurity: {
    query: "cybersecurity vulnerability security breach zero-day threat",
  },
  "cloud-computing": {
    query: "cloud computing serverless cloud-native AWS Azure GCP",
  },
  databases: {
    query: "database PostgreSQL MongoDB SQL NoSQL Redis",
  },
  "programming-languages": {
    query: "programming language Python JavaScript TypeScript Rust Go",
  },
  "system-design": {
    query:
      "system design software architecture distributed systems scalability",
  },
};

export interface TavilyNewsConfig {
  apiKey: string;
}

function parsePublishedDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export class TavilyNewsAdapter implements INewsService {
  private readonly logger = new Logger(TavilyNewsAdapter.name);
  private readonly client: ReturnType<typeof tavily>;

  constructor(config: TavilyNewsConfig) {
    this.client = tavily({ apiKey: config.apiKey });
  }

  async fetchByCategory(slug: string, name: string): Promise<NewsArticle[]> {
    const mapping = CATEGORY_SEARCH_MAP[slug];
    const query = mapping?.query ?? name;

    try {
      const response = await this.client.search(query, {
        topic: "news",
        searchDepth: "basic",
        maxResults: 5,
        timeRange: "week",
      });

      if (!response.results || response.results.length === 0) {
        this.logger.warn(
          `No results returned from Tavily for slug="${slug}", query="${query}"`,
        );
        return [];
      }

      return response.results.map(
        (r) =>
          new NewsArticle(
            "",
            r.title,
            r.content ?? "",
            r.url,
            null,
            extractDomain(r.url),
            parsePublishedDate(r.publishedDate),
            "",
            slug,
          ),
      );
    } catch (error) {
      this.logger.error(
        `Tavily search failed for slug="${slug}"`,
        error instanceof Error ? error.stack : String(error),
      );
      return [];
    }
  }
}
