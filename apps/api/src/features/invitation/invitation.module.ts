import { Module } from '@nestjs/common';
import { INVITATION_REPOSITORY } from '@sagepoint/domain';
import { getDependencies } from '@/core/bootstrap';
import { InvitationController } from './invitation.controller';
import { CreateInvitationUseCase } from './app/usecases/create-invitation.usecase';
import { FindAllInvitationsUseCase } from './app/usecases/find-all-invitations.usecase';
import { RevokeInvitationUseCase } from './app/usecases/revoke-invitation.usecase';
import { ValidateInvitationTokenUseCase } from './app/usecases/validate-invitation-token.usecase';
import { AcceptInvitationUseCase } from './app/usecases/accept-invitation.usecase';
import { CreateUserDirectUseCase } from './app/usecases/create-user-direct.usecase';

@Module({
  controllers: [InvitationController],
  providers: [
    {
      provide: INVITATION_REPOSITORY,
      useFactory: () => getDependencies().invitation.invitationRepository,
    },
    {
      provide: CreateInvitationUseCase,
      useFactory: () => getDependencies().invitation.createInvitationUseCase,
    },
    {
      provide: FindAllInvitationsUseCase,
      useFactory: () => getDependencies().invitation.findAllInvitationsUseCase,
    },
    {
      provide: RevokeInvitationUseCase,
      useFactory: () => getDependencies().invitation.revokeInvitationUseCase,
    },
    {
      provide: ValidateInvitationTokenUseCase,
      useFactory: () =>
        getDependencies().invitation.validateInvitationTokenUseCase,
    },
    {
      provide: AcceptInvitationUseCase,
      useFactory: () => getDependencies().invitation.acceptInvitationUseCase,
    },
    {
      provide: CreateUserDirectUseCase,
      useFactory: () => getDependencies().invitation.createUserDirectUseCase,
    },
  ],
  exports: [AcceptInvitationUseCase, ValidateInvitationTokenUseCase],
})
export class InvitationModule {}
