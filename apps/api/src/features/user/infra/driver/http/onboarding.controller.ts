import { Controller, Post, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { UpdateUserProfileUseCase } from '../../../app/usecases/update-user-profile.usecase';
// Assuming AuthGuard exists and adds user to req
// import { JwtAuthGuard } from '@/features/auth/guards/jwt-auth.guard'; 

@Controller('users/onboarding')
export class OnboardingController {
  constructor(
    @Inject('UpdateUserProfileUseCase') private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard) // Enable when AuthGuard is ready/imported
  async completeOnboarding(@Body() body: { goal: string; interests: string[] }, @Req() req: any) {
    // Mock user ID if auth not fully wired yet, or get from req.user.id
    const userId = req.user?.id || 'mock-user-id'; 
    await this.updateUserProfileUseCase.execute(userId, body.goal, body.interests || []);
    return { success: true };
  }
}
