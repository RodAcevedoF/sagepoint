import { User, UserRole } from '@sagepoint/domain';
export const USER_SERVICE = Symbol('USER_SERVICE');

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  passwordHash?: string;
}

export interface IUserService {
  create(input: CreateUserInput): Promise<User>;
  save(user: User): Promise<void>;
  get(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
}
