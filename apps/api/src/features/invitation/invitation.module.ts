import { Module } from '@nestjs/common';
import { INVITATION_REPOSITORY } from '@sagepoint/domain';
import { UserModule } from '@/features/user/user.module';
import { getDependencies } from '@/core/bootstrap';
import { InvitationController } from './invitation.controller';
import { CreateInvitationUseCase } from './app/usecases/create-invitation.usecase';
import { FindAllInvitationsUseCase } from './app/usecases/find-all-invitations.usecase';
import { RevokeInvitationUseCase } from './app/usecases/revoke-invitation.usecase';
import { ValidateInvitationTokenUseCase } from './app/usecases/validate-invitation-token.usecase';
import { AcceptInvitationUseCase } from './app/usecases/accept-invitation.usecase';
import { CreateUserDirectUseCase } from './app/usecases/create-user-direct.usecase';

@Module({
  imports: [UserModule],
  controllers: [InvitationController],
  providers: [
    {
      provide: INVITATION_REPOSITORY,
      useFactory: () => getDependencies().invitation.invitationRepository,
    },
    CreateInvitationUseCase,
    FindAllInvitationsUseCase,
    RevokeInvitationUseCase,
    ValidateInvitationTokenUseCase,
    AcceptInvitationUseCase,
    CreateUserDirectUseCase,
  ],
  exports: [AcceptInvitationUseCase, ValidateInvitationTokenUseCase],
})
export class InvitationModule {}
