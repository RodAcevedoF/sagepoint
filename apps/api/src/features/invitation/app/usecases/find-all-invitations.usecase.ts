import { Injectable, Inject } from '@nestjs/common';
import type { IInvitationRepository } from '@sagepoint/domain';
import { Invitation, INVITATION_REPOSITORY } from '@sagepoint/domain';

@Injectable()
export class FindAllInvitationsUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(): Promise<Invitation[]> {
    return this.invitationRepo.findAll();
  }
}
