import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';
import { INVITATION_REPOSITORY } from '@sagepoint/domain';

@Injectable()
export class ValidateInvitationTokenUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(token: string): Promise<{ email: string; role: string }> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    return { email: invitation.email, role: invitation.role };
  }
}
