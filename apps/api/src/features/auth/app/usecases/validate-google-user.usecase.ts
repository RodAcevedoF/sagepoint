import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { User, UserRole } from '@sagepoint/domain';

export interface GoogleUserDetails {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

export class ValidateGoogleUserUseCase {
  constructor(private readonly userService: IUserService) {}

  async execute(details: GoogleUserDetails): Promise<User> {
    const existingUser = await this.userService.getByEmail(details.email);
    if (existingUser) {
      return existingUser;
    }

    const newUser = await this.userService.create({
      email: details.email,
      name: `${details.firstName} ${details.lastName}`,
      role: UserRole.USER,
    });

    // Google users are automatically verified
    const verifiedUser = newUser.verify();
    await this.userService.save(verifiedUser);

    return verifiedUser;
  }
}
