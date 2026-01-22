import { Controller, Post, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { UpdateUserProfileUseCase } from '../../../app/usecases/update-user-profile.usecase';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';

@Controller('users/onboarding')
export class OnboardingController {
  constructor(
    @Inject('UpdateUserProfileUseCase') private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@Body() body: { goal: string; interests: string[] }, @Req() req: any) {
    const userId = req.user.id; 
    await this.updateUserProfileUseCase.execute(userId, body.goal, body.interests || []);
    return { success: true };
  }
}
