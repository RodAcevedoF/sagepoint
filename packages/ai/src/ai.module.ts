import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  CONTENT_ANALYSIS_SERVICE,
  DOCUMENT_ANALYSIS_SERVICE,
  QUIZ_GENERATION_SERVICE,
  IMAGE_TEXT_EXTRACTION_SERVICE,
  ROADMAP_GENERATION_SERVICE,
  TOPIC_CONCEPT_GENERATION_SERVICE,
  RESOURCE_DISCOVERY_SERVICE,
  BLOG_POST_GENERATION_SERVICE,
} from "@sagepoint/domain";
import { OpenAiContentAnalysisAdapter } from "./openai-content-analysis.adapter";
import { OpenAiRoadmapGeneratorAdapter } from "./openai-roadmap-generator.adapter";
import { OpenAiTopicConceptGeneratorAdapter } from "./openai-topic-concept-generator.adapter";
import { PerplexityResearchAdapter } from "./perplexity-research.adapter";
import { OpenAiVisionTextExtractorAdapter } from "./openai-vision-text-extractor.adapter";
import { OpenAiDocumentAnalysisAdapter } from "./openai-document-analysis.adapter";
import { OpenAiQuizGenerationAdapter } from "./openai-quiz-generation.adapter";
import { OpenAiBlogPostGenerationAdapter } from "./openai-blog-post-generation.adapter";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CONTENT_ANALYSIS_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiContentAnalysisAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_CONTENT_ANALYSIS"),
        }),
      inject: [ConfigService],
    },
    {
      provide: ROADMAP_GENERATION_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiRoadmapGeneratorAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_ROADMAP_GENERATION"),
        }),
      inject: [ConfigService],
    },
    {
      provide: TOPIC_CONCEPT_GENERATION_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiTopicConceptGeneratorAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_TOPIC_CONCEPT_GENERATION"),
        }),
      inject: [ConfigService],
    },
    {
      provide: RESOURCE_DISCOVERY_SERVICE,
      useFactory: (config: ConfigService) =>
        new PerplexityResearchAdapter({
          apiKey: config.get("PERPLEXITY_API_KEY") ?? "",
        }),
      inject: [ConfigService],
    },
    {
      provide: IMAGE_TEXT_EXTRACTION_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiVisionTextExtractorAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_VISION_TEXT_EXTRACTION"),
        }),
      inject: [ConfigService],
    },
    {
      provide: DOCUMENT_ANALYSIS_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiDocumentAnalysisAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_DOCUMENT_ANALYSIS"),
        }),
      inject: [ConfigService],
    },
    {
      provide: QUIZ_GENERATION_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiQuizGenerationAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_QUIZ_GENERATION"),
        }),
      inject: [ConfigService],
    },
    {
      provide: BLOG_POST_GENERATION_SERVICE,
      useFactory: (config: ConfigService) =>
        new OpenAiBlogPostGenerationAdapter({
          apiKey: config.get("OPENAI_API_KEY") ?? "",
          modelName: config.get("MODEL_BLOG_POST_GENERATION"),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [
    CONTENT_ANALYSIS_SERVICE,
    ROADMAP_GENERATION_SERVICE,
    TOPIC_CONCEPT_GENERATION_SERVICE,
    RESOURCE_DISCOVERY_SERVICE,
    IMAGE_TEXT_EXTRACTION_SERVICE,
    DOCUMENT_ANALYSIS_SERVICE,
    QUIZ_GENERATION_SERVICE,
    BLOG_POST_GENERATION_SERVICE,
  ],
})
export class AiModule {}
