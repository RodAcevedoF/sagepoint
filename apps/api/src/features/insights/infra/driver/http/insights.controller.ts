import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { GetInsightsUseCase } from '../../../app/usecases/get-insights.usecase';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(
    @Inject('GetInsightsUseCase')
    private readonly getInsightsUseCase: GetInsightsUseCase,
  ) {}

  @Get()
  async getInsights(@CurrentUser() user: RequestUser) {
    return this.getInsightsUseCase.execute(user.id);
  }
}
