import type { IInvitationRepository } from '@sagepoint/domain';
import { Invitation } from '@sagepoint/domain';

export class FindAllInvitationsUseCase {
  constructor(private readonly invitationRepo: IInvitationRepository) {}

  async execute(): Promise<Invitation[]> {
    return this.invitationRepo.findAll();
  }
}
