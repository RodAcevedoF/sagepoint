import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiContentAnalysisAdapter } from './openai-content-analysis.adapter';
import { OpenAiRoadmapGeneratorAdapter } from './openai-roadmap-generator.adapter';
import { OpenAiTopicConceptGeneratorAdapter } from './openai-topic-concept-generator.adapter';
import { PerplexityResearchAdapter } from './perplexity-research.adapter';

@Module({
  imports: [ConfigModule],
  providers: [OpenAiContentAnalysisAdapter, OpenAiRoadmapGeneratorAdapter, OpenAiTopicConceptGeneratorAdapter, PerplexityResearchAdapter],
  exports: [OpenAiContentAnalysisAdapter, OpenAiRoadmapGeneratorAdapter, OpenAiTopicConceptGeneratorAdapter, PerplexityResearchAdapter],
})
export class AiModule {}
