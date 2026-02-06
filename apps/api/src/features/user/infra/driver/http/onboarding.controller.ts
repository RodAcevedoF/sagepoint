import { Controller, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@sagepoint/domain';
import {
  USER_SERVICE,
  type IUserService,
} from '@/features/user/domain/inbound/user.service';

interface OnboardingDto {
  learningGoal?: string;
  experienceLevel?: string;
  interests?: string[];
  weeklyHoursGoal?: number;
  status: 'COMPLETED' | 'SKIPPED' | 'PENDING';
}

@Controller('users/me/onboarding')
export class OnboardingController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(
    @Body() body: OnboardingDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.userService.completeOnboarding(user.id, {
      learningGoal: body.learningGoal,
      experienceLevel: body.experienceLevel,
      interests: body.interests || [],
      weeklyHoursGoal: body.weeklyHoursGoal,
      status: body.status,
    });
    return { success: true };
  }
}
