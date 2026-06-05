import { Injectable, Inject } from '@nestjs/common';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { User, UserRole } from '@sagepoint/domain';

export interface GoogleUserDetails {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

@Injectable()
export class ValidateGoogleUserUseCase {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {}

  async execute(details: GoogleUserDetails): Promise<User> {
    const existingUser = await this.userService.getByEmail(details.email);
    if (existingUser) {
      return existingUser;
    }

    const name =
      [details.firstName, details.lastName]
        .filter((p): p is string => Boolean(p?.trim()))
        .join(' ')
        .trim() || details.email.split('@')[0];

    const newUser = await this.userService.create({
      email: details.email,
      name,
      role: UserRole.USER,
    });

    // Google users are automatically verified
    const verifiedUser = newUser.verify();
    await this.userService.save(verifiedUser);

    return verifiedUser;
  }
}
