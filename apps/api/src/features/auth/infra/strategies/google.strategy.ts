import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Inject } from '@nestjs/common';
import type { IAuthService } from '@/features/auth/domain/inbound/auth.service.port';
import { AUTH_SERVICE } from '@/features/auth/domain/inbound/auth.service.port';

export interface GoogleConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('GOOGLE_CONFIG') config: GoogleConfig,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {
    super({
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = await this.authService.validateGoogleUser({
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value,
    });
    done(null, user);
  }
}
