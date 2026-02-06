import { User } from '@sagepoint/domain';
import { IUserRepository } from '@sagepoint/domain';
import { randomUUID } from 'crypto';

import { UserRole } from '@sagepoint/domain';

export interface CreateUserCommand {
  email: string;
  name: string;
  role?: UserRole;
  passwordHash?: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      // In a real app we might throw ConflictException,
      // but strictly speaking idempotency could also return the existing one.
      return existing;
    }

    const id = randomUUID();
    const user = User.create(
      id,
      command.email,
      command.name,
      command.role,
      command.passwordHash,
    );

    await this.userRepository.save(user);

    return user;
  }
}
