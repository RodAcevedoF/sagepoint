import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    OpenAiContentAnalysisAdapter,
    OpenAiRoadmapGeneratorAdapter,
    OpenAiTopicConceptGeneratorAdapter,
    PerplexityResearchAdapter,
    OpenAiVisionTextExtractorAdapter,
    OpenAiDocumentAnalysisAdapter,
    OpenAiQuizGenerationAdapter,
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
