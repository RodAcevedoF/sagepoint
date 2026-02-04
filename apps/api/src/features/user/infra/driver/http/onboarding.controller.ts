import { Controller, Post, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { USER_SERVICE, type IUserService } from '@/features/user/domain/inbound/user.service';

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
  async completeOnboarding(@Body() body: OnboardingDto, @Req() req: any) {
    const userId = req.user.id;
    await this.userService.completeOnboarding(userId, {
      learningGoal: body.learningGoal,
      experienceLevel: body.experienceLevel,
      interests: body.interests || [],
      weeklyHoursGoal: body.weeklyHoursGoal,
      status: body.status,
    });
    return { success: true };
  }
}
