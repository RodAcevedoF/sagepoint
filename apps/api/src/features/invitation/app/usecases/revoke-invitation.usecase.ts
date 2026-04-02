import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';

export class RevokeInvitationUseCase {
  constructor(private readonly invitationRepo: IInvitationRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const invitation = await this.invitationRepo.findById(id);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (!invitation.isPending()) {
      throw new BadRequestException('Only pending invitations can be revoked');
    }

    const revoked = invitation.revoke();
    await this.invitationRepo.save(revoked);

    return { success: true };
  }
}
