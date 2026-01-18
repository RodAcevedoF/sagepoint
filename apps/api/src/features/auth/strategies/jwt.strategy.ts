import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { User } from '@sagepoint/domain';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['access_token'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev_secret',
    });
    const secret = this.configService.get<string>('JWT_SECRET') || 'dev_secret';
    console.log(`[JwtStrategy] Initialized with secret: ${secret.substring(0, 3)}... (Length: ${secret.length})`);
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.get(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
