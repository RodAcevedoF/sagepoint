import { BadRequestException } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';

export class AcceptInvitationUseCase {
  constructor(private readonly invitationRepo: IInvitationRepository) {}

  async execute(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const accepted = invitation.accept(userId);
    await this.invitationRepo.save(accepted);
  }
}
