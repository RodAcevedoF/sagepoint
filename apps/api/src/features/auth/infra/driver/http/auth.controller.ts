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
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { IAuthService } from '@/features/auth/domain/inbound/auth.service.port';
import { AUTH_SERVICE } from '@/features/auth/domain/inbound/auth.service.port';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { GoogleAuthGuard } from '@/features/auth/infra/guards/google-auth.guard';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { User } from '@sagepoint/domain';
import { RegisterDto } from '@/features/auth/app/dto/register.dto';
import { toUserResponseDto } from '@/features/user/app/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.handleLogin(user, response);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // GoogleStrategy returns full User, not RequestUser
    const user = request.user as User;
    await this.handleLogin(user, response);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    response.redirect(`${frontendUrl}/dashboard?login=success`);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, string> | undefined)
      ?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refresh(refreshToken);
    this.setCookies(response, result.accessToken, result.refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: toUserResponseDto(result.user),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() reqUser: RequestUser) {
    const user = await this.userService.get(reqUser.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return toUserResponseDto(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() reqUser: RequestUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(reqUser.id);
    this.clearCookies(response);
    return { message: 'Logged out successfully' };
  }

  private async handleLogin(user: User, response: Response) {
    const result = await this.authService.login(user);
    this.setCookies(response, result.accessToken, result.refreshToken);
    // Return tokens in body for server-side auth (Next.js server actions)
    // Cookies are also set for browser-based auth (Google OAuth redirect)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: toUserResponseDto(result.user),
    };
  }

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    // Access Token Cookie
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh Token Cookie
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearCookies(response: Response) {
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });
  }
}
