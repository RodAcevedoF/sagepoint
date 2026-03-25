import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { IInvitationRepository, IUserRepository } from '@sagepoint/domain';
import {
  Invitation,
  INVITATION_REPOSITORY,
  USER_REPOSITORY,
  UserRole,
} from '@sagepoint/domain';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import { EMAIL_SERVICE_PORT } from '@/features/auth/domain/outbound/email.service.port';
import { v4 as uuid } from 'uuid';

const INVITATION_TTL_DAYS = 7;

export interface CreateInvitationInput {
  email: string;
  role?: string;
}

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepo: IInvitationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(EMAIL_SERVICE_PORT)
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    input: CreateInvitationInput,
    invitedById: string,
  ): Promise<Invitation> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const pendingInvite = await this.invitationRepo.findPendingByEmail(
      input.email,
    );
    if (pendingInvite) {
      throw new ConflictException(
        'A pending invitation already exists for this email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

    const invitation = Invitation.create(
      uuid(),
      input.email,
      token,
      invitedById,
      expiresAt,
      (input.role as UserRole) ?? UserRole.USER,
    );

    await this.invitationRepo.save(invitation);
    await this.emailService.sendInvitationEmail(input.email, token);

    return invitation;
  }
}
