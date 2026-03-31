import {
  IInvitationRepository,
  Invitation,
  InvitationStatus,
  UserRole,
} from "@sagepoint/domain";
import type {
  PrismaClient,
  Invitation as PrismaInvitation,
} from "../generated/prisma/client";

export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(invitation: Invitation): Promise<void> {
    await this.prisma.invitation.upsert({
      where: { id: invitation.id },
      create: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitedById: invitation.invitedById,
        acceptedById: invitation.acceptedById,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      },
      update: {
        status: invitation.status,
        acceptedById: invitation.acceptedById,
        updatedAt: invitation.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Invitation | null> {
    const data = await this.prisma.invitation.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const data = await this.prisma.invitation.findUnique({ where: { token } });
    return data ? this.mapToDomain(data) : null;
  }

  async findPendingByEmail(email: string): Promise<Invitation | null> {
    const data = await this.prisma.invitation.findFirst({
      where: {
        email,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(): Promise<Invitation[]> {
    const data = await this.prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  private mapToDomain(data: PrismaInvitation): Invitation {
    return new Invitation(
      data.id,
      data.email,
      data.token,
      data.role as UserRole,
      data.status as InvitationStatus,
      data.expiresAt,
      data.invitedById,
      data.acceptedById,
      data.createdAt,
      data.updatedAt,
    );
  }
}
