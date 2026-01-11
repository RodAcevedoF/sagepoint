import {
  Controller,
  Post,
  Get,
  UseGuards,
  Res,
  Req,
  Body,
  Query,
  Inject,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { IAuthService } from '@/features/auth/domain/inbound/auth.service.port';
import { AUTH_SERVICE } from '@/features/auth/domain/inbound/auth.service.port';
import { GoogleAuthGuard } from '@/features/auth/guards/google-auth.guard';
import { JwtAuthGuard } from '@/features/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import { User } from '@sagepoint/domain';
import { RegisterDto } from '@/features/auth/dto/register.dto';
import { UserAlreadyExistsError } from '@/features/auth/app/usecases/register.usecase';
import { InvalidVerificationTokenError, UserNotFoundError } from '@/features/auth/app/usecases/verify-email.usecase';
import { EmailNotVerifiedError } from '@/features/auth/app/usecases/validate-user.usecase';
import { InvalidRefreshTokenError } from '@/features/auth/app/usecases/refresh-token.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      if (error instanceof InvalidVerificationTokenError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof UserNotFoundError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.handleLogin(user, response);
    } catch (error) {
      if (error instanceof EmailNotVerifiedError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.handleLogin(user, response);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const result = await this.authService.refresh(refreshToken);
      this.setRefreshTokenCookie(response, result.refreshToken);
      return { accessToken: result.accessToken, user: result.user };
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.id);
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  private async handleLogin(user: User, response: Response) {
    const result = await this.authService.login(user);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
