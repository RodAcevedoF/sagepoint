import { User } from '../../user/entities/user.entity';

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
}
