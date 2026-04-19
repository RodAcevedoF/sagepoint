import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import {
  INSIGHTS_SERVICE,
  type IInsightsService,
} from '../../../domain/inbound/insights.service';

@Controller('insights')
export class InsightsController {
  constructor(
    @Inject(INSIGHTS_SERVICE)
    private readonly insightsService: IInsightsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInsights(@CurrentUser() user: RequestUser) {
    return this.insightsService.getForUser(user.id);
  }

  @Get('public')
  async getPublicInsights() {
    return this.insightsService.getPublic(13);
  }
}
