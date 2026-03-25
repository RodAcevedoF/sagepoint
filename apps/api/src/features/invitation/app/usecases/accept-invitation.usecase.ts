import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';
import { INVITATION_REPOSITORY } from '@sagepoint/domain';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const accepted = invitation.accept(userId);
    await this.invitationRepo.save(accepted);
  }
}
