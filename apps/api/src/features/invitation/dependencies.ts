import type { IInvitationRepository, IUserRepository } from '@sagepoint/domain';
import { PrismaInvitationRepository } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import { AcceptInvitationUseCase } from './app/usecases/accept-invitation.usecase';
import { CreateInvitationUseCase } from './app/usecases/create-invitation.usecase';
import { CreateUserDirectUseCase } from './app/usecases/create-user-direct.usecase';
import { FindAllInvitationsUseCase } from './app/usecases/find-all-invitations.usecase';
import { RevokeInvitationUseCase } from './app/usecases/revoke-invitation.usecase';
import { ValidateInvitationTokenUseCase } from './app/usecases/validate-invitation-token.usecase';

export interface InvitationDependencies {
  invitationRepository: IInvitationRepository;
  createInvitationUseCase: CreateInvitationUseCase;
  findAllInvitationsUseCase: FindAllInvitationsUseCase;
  revokeInvitationUseCase: RevokeInvitationUseCase;
  validateInvitationTokenUseCase: ValidateInvitationTokenUseCase;
  acceptInvitationUseCase: AcceptInvitationUseCase;
  createUserDirectUseCase: CreateUserDirectUseCase;
}

export function makeInvitationDependencies(
  userRepo: IUserRepository,
  emailService: IEmailService,
  passwordHasher: IPasswordHasher,
): InvitationDependencies {
  const prismaService = new PrismaService();
  const invitationRepository = new PrismaInvitationRepository(prismaService);

  return {
    invitationRepository,
    createInvitationUseCase: new CreateInvitationUseCase(
      invitationRepository,
      userRepo,
      emailService,
    ),
    findAllInvitationsUseCase: new FindAllInvitationsUseCase(
      invitationRepository,
    ),
    revokeInvitationUseCase: new RevokeInvitationUseCase(invitationRepository),
    validateInvitationTokenUseCase: new ValidateInvitationTokenUseCase(
      invitationRepository,
    ),
    acceptInvitationUseCase: new AcceptInvitationUseCase(invitationRepository),
    createUserDirectUseCase: new CreateUserDirectUseCase(
      userRepo,
      passwordHasher,
    ),
  };
}
