import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiContentAnalysisAdapter } from './openai-content-analysis.adapter';
import { OpenAiRoadmapGeneratorAdapter } from './openai-roadmap-generator.adapter';
import { PerplexityResearchAdapter } from './perplexity-research.adapter';

@Module({
  imports: [ConfigModule],
  providers: [OpenAiContentAnalysisAdapter, OpenAiRoadmapGeneratorAdapter, PerplexityResearchAdapter],
  exports: [OpenAiContentAnalysisAdapter, OpenAiRoadmapGeneratorAdapter, PerplexityResearchAdapter],
})
export class AiModule {}
