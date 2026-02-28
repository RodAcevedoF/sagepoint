import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenAiContentAnalysisAdapter } from './openai-content-analysis.adapter';
import { OpenAiRoadmapGeneratorAdapter } from './openai-roadmap-generator.adapter';
import { OpenAiTopicConceptGeneratorAdapter } from './openai-topic-concept-generator.adapter';
import { PerplexityResearchAdapter } from './perplexity-research.adapter';
import { OpenAiVisionTextExtractorAdapter } from './openai-vision-text-extractor.adapter';
import { OpenAiDocumentAnalysisAdapter } from './openai-document-analysis.adapter';
import { OpenAiQuizGenerationAdapter } from './openai-quiz-generation.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: OpenAiContentAnalysisAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiContentAnalysisAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_CONTENT_ANALYSIS'),
        }),
      inject: [ConfigService],
    },
    {
      provide: OpenAiRoadmapGeneratorAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiRoadmapGeneratorAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_ROADMAP_GENERATION'),
        }),
      inject: [ConfigService],
    },
    {
      provide: OpenAiTopicConceptGeneratorAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiTopicConceptGeneratorAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_TOPIC_CONCEPT_GENERATION'),
        }),
      inject: [ConfigService],
    },
    PerplexityResearchAdapter,
    {
      provide: OpenAiVisionTextExtractorAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiVisionTextExtractorAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_VISION_TEXT_EXTRACTION'),
        }),
      inject: [ConfigService],
    },
    {
      provide: OpenAiDocumentAnalysisAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiDocumentAnalysisAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_DOCUMENT_ANALYSIS'),
        }),
      inject: [ConfigService],
    },
    {
      provide: OpenAiQuizGenerationAdapter,
      useFactory: (config: ConfigService) =>
        new OpenAiQuizGenerationAdapter({
          apiKey: config.get('OPENAI_API_KEY') ?? '',
          modelName: config.get('MODEL_QUIZ_GENERATION'),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [
    OpenAiContentAnalysisAdapter,
    OpenAiRoadmapGeneratorAdapter,
    OpenAiTopicConceptGeneratorAdapter,
    PerplexityResearchAdapter,
    OpenAiVisionTextExtractorAdapter,
    OpenAiDocumentAnalysisAdapter,
    OpenAiQuizGenerationAdapter,
  ],
})
export class AiModule {}
