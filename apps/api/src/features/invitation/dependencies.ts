import type { IInvitationRepository } from '@sagepoint/domain';
import { PrismaInvitationRepository } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export interface InvitationDependencies {
  invitationRepository: IInvitationRepository;
}

export function makeInvitationDependencies(): InvitationDependencies {
  const prismaService = new PrismaService();
  const invitationRepository = new PrismaInvitationRepository(prismaService);

  return {
    invitationRepository,
  };
}
