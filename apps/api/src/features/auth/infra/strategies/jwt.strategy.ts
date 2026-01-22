import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import type { RequestUser } from '@/features/auth/domain/request-user';
import type { JwtConfig } from '@/features/auth/infra/driven/jwt-token.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('JWT_CONFIG') config: JwtConfig) {
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
      secretOrKey: config.accessSecret,
    });
  }

  /**
   * JWT is already verified by passport-jwt.
   * Just return the payload as RequestUser - no DB call needed.
   */
  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
