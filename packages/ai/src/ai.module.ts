import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiContentAnalysisAdapter } from './openai-content-analysis.adapter';

@Module({
  imports: [ConfigModule],
  providers: [OpenAiContentAnalysisAdapter],
  exports: [OpenAiContentAnalysisAdapter],
})
export class AiModule {}
