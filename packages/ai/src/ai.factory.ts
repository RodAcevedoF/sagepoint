import {
  IRoadmapGenerationService,
  ITopicConceptGenerationService,
  IResourceDiscoveryService,
} from '@sagepoint/domain';
import { OpenAiRoadmapGeneratorAdapter } from './openai-roadmap-generator.adapter';
import { OpenAiTopicConceptGeneratorAdapter } from './openai-topic-concept-generator.adapter';
import { PerplexityResearchAdapter } from './perplexity-research.adapter';

export interface AiConfig {
  openAiApiKey: string;
  perplexityApiKey: string;
}

export interface AiAdapters {
  roadmapGenerator: IRoadmapGenerationService;
  topicConceptGenerator: ITopicConceptGenerationService;
  resourceDiscovery: IResourceDiscoveryService;
}

export function createAiAdapters(config: AiConfig): AiAdapters {
  return {
    roadmapGenerator: new OpenAiRoadmapGeneratorAdapter({
      apiKey: config.openAiApiKey,
    }),
    topicConceptGenerator: new OpenAiTopicConceptGeneratorAdapter({
      apiKey: config.openAiApiKey,
    }),
    resourceDiscovery: new PerplexityResearchAdapter({
      apiKey: config.perplexityApiKey,
    }),
  };
}
