import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  IResourceDiscoveryService,
  ResourceDiscoveryOptions,
  DiscoveredResource,
  ConceptForDiscovery,
} from "@sagepoint/domain";
import { ResourceType } from "@sagepoint/domain";
import Exa from "exa-js";
import { withRetry } from "./retry";

@Injectable()
export class ExaResearchAdapter implements IResourceDiscoveryService {
  private readonly exa: Exa;
  private readonly logger = new Logger(ExaResearchAdapter.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | { apiKey: string },
  ) {
    const apiKey =
      configOrService && "apiKey" in configOrService
        ? configOrService.apiKey
        : configOrService && "get" in configOrService
          ? (configOrService.get<string>("EXA_API_KEY") ?? "")
          : (process.env.EXA_API_KEY ?? "");
    this.exa = new Exa(apiKey);
  }

  async discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions,
  ): Promise<DiscoveredResource[]> {
    const want = options?.maxResults ?? 3;
    // Fetch more than needed so we can pick a diverse set
    const fetchCount = Math.min(want * 3 + 2, 20);
    const query = conceptDescription
      ? `${conceptName} ${conceptDescription} tutorial video course article documentation`
      : `learn ${conceptName} tutorial video course article documentation`;

    try {
      this.logger.log(`Discovering resources for concept: "${conceptName}"`);

      const response = await withRetry(
        () => {
          const searchPromise = this.exa.searchAndContents(query, {
            type: "auto",
            numResults: fetchCount,
            highlights: true,
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  Object.assign(new Error("Exa search timeout"), {
                    code: "ETIMEDOUT",
                  }),
                ),
              15_000,
            ),
          );
          return Promise.race([searchPromise, timeoutPromise]);
        },
        { opName: "exa.search-and-contents", logger: this.logger },
      );

      const PAID_DOMAINS = [
        "udemy.com",
        "pluralsight.com",
        "linkedin.com/learning",
      ];
      const seenDomains = new Set<string>();
      const resources: DiscoveredResource[] = [];

      for (const r of response.results) {
        if (!r.url || !r.title) continue;
        if (options?.freeOnly && PAID_DOMAINS.some((d) => r.url.includes(d)))
          continue;

        const mapped = this.mapResult(r);
        if (
          options?.preferredTypes?.length &&
          !options.preferredTypes.includes(mapped.type)
        )
          continue;

        // Prefer one result per domain for variety
        const domain = extractDomain(r.url);
        if (seenDomains.has(domain)) continue;
        seenDomains.add(domain);

        resources.push(mapped);
        if (resources.length >= want) break;
      }

      this.logger.log(
        `Discovered ${resources.length} resources for "${conceptName}"`,
      );
      return resources;
    } catch (error) {
      this.logger.error(
        `Failed to discover resources for "${conceptName}"`,
        error,
      );
      return [];
    }
  }

  async discoverResourcesForConcepts(
    concepts: ConceptForDiscovery[],
    options?: ResourceDiscoveryOptions,
  ): Promise<Map<string, DiscoveredResource[]>> {
    const result = new Map<string, DiscoveredResource[]>();
    if (concepts.length === 0) return result;

    const BATCH_SIZE = 4;
    for (let i = 0; i < concepts.length; i += BATCH_SIZE) {
      const batch = concepts.slice(i, i + BATCH_SIZE);
      this.logger.log(
        `Discovering resources for batch of ${batch.length} concepts: ${batch.map((c) => c.name).join(", ")}`,
      );
      const settled = await Promise.all(
        batch.map((c) =>
          this.discoverResourcesForConcept(c.name, c.description, options).then(
            (resources) => ({ id: c.id, resources }),
          ),
        ),
      );
      for (const { id, resources } of settled) {
        result.set(id, resources);
      }
    }

    return result;
  }

  private mapResult(r: {
    title?: string | null;
    url: string;
    highlights?: string[] | null;
    author?: string | null;
    publishedDate?: string | null;
  }): DiscoveredResource {
    return {
      title: r.title ?? r.url,
      url: r.url,
      type: inferResourceType(r.url),
      description: r.highlights?.[0] ?? undefined,
      provider: inferProvider(r.url),
      estimatedDuration: undefined,
      difficulty: undefined,
    };
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function inferResourceType(url: string): ResourceType {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return ResourceType.VIDEO;
  if (
    lower.includes("udemy.com") ||
    lower.includes("coursera.org") ||
    lower.includes("edx.org") ||
    lower.includes("pluralsight.com") ||
    lower.includes("linkedin.com/learning") ||
    lower.includes("egghead.io")
  )
    return ResourceType.COURSE;
  if (
    lower.includes("/docs/") ||
    lower.startsWith("https://docs.") ||
    lower.includes("developer.mozilla.org") ||
    lower.includes("readthedocs.io") ||
    lower.includes("pkg.go.dev") ||
    lower.includes("api.")
  )
    return ResourceType.DOCUMENTATION;
  if (
    lower.includes("medium.com") ||
    lower.includes("dev.to") ||
    lower.includes("hashnode") ||
    lower.includes("substack") ||
    lower.includes(".blog") ||
    lower.includes("/blog/")
  )
    return ResourceType.ARTICLE;
  return ResourceType.TUTORIAL;
}

function inferProvider(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const known: Record<string, string> = {
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "udemy.com": "Udemy",
      "coursera.org": "Coursera",
      "edx.org": "edX",
      "pluralsight.com": "Pluralsight",
      "developer.mozilla.org": "MDN",
      "medium.com": "Medium",
      "dev.to": "dev.to",
      "github.com": "GitHub",
      "stackoverflow.com": "Stack Overflow",
      "freecodecamp.org": "freeCodeCamp",
      "egghead.io": "Egghead",
    };
    return known[hostname] ?? hostname;
  } catch {
    return undefined;
  }
}
