import { User } from '@sagepoint/domain';

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

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

export interface IAuthService {
  register(input: RegisterInput): Promise<{ message: string }>;
  verifyEmail(token: string): Promise<{ message: string }>;
  login(user: User): Promise<LoginResult>;
  logout(userId: string): Promise<void>;
  refresh(refreshToken: string): Promise<LoginResult>;
  validateUser(email: string, password: string): Promise<User | null>;
  validateGoogleUser(details: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }): Promise<User>;
}
