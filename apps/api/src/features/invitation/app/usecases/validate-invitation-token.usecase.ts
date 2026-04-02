import { BadRequestException } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';

export class ValidateInvitationTokenUseCase {
  constructor(private readonly invitationRepo: IInvitationRepository) {}

  async execute(token: string): Promise<{ email: string; role: string }> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    return { email: invitation.email, role: invitation.role };
  }
}
