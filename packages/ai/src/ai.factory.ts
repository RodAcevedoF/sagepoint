import {
  IRoadmapGenerationService,
  ITopicConceptGenerationService,
  IResourceDiscoveryService,
  IDocumentAnalysisService,
  IQuizGenerationService,
  IImageTextExtractionService,
} from '@sagepoint/domain';
import { OpenAiRoadmapGeneratorAdapter } from './openai-roadmap-generator.adapter';
import { OpenAiTopicConceptGeneratorAdapter } from './openai-topic-concept-generator.adapter';
import { PerplexityResearchAdapter } from './perplexity-research.adapter';
import { OpenAiDocumentAnalysisAdapter } from './openai-document-analysis.adapter';
import { OpenAiQuizGenerationAdapter } from './openai-quiz-generation.adapter';
import { OpenAiVisionTextExtractorAdapter } from './openai-vision-text-extractor.adapter';

export interface AiConfig {
  openAiApiKey: string;
  perplexityApiKey: string;
}

export interface AiAdapters {
  roadmapGenerator: IRoadmapGenerationService;
  topicConceptGenerator: ITopicConceptGenerationService;
  resourceDiscovery: IResourceDiscoveryService;
  documentAnalysis: IDocumentAnalysisService;
  quizGeneration: IQuizGenerationService;
  imageTextExtraction: IImageTextExtractionService;
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
    documentAnalysis: new OpenAiDocumentAnalysisAdapter({
      apiKey: config.openAiApiKey,
    }),
    quizGeneration: new OpenAiQuizGenerationAdapter({
      apiKey: config.openAiApiKey,
    }),
    imageTextExtraction: new OpenAiVisionTextExtractorAdapter({
      apiKey: config.openAiApiKey,
    }),
  };
}
