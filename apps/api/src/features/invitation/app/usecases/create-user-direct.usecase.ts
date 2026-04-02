import { ConflictException } from '@nestjs/common';
import type { IUserRepository } from '@sagepoint/domain';
import { User, UserRole } from '@sagepoint/domain';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import { v4 as uuid } from 'uuid';

export interface CreateUserDirectInput {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export class CreateUserDirectUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserDirectInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const role = (input.role as UserRole) ?? UserRole.USER;

    const user = User.create(
      uuid(),
      input.email,
      input.name,
      role,
      passwordHash,
    );
    const verified = user.verify();

    await this.userRepo.save(verified);

    return verified;
  }
}
