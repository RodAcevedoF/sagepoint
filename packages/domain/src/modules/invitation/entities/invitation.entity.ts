import { UserRole } from "../../user/entities/user.entity";
import { InvitationStatus } from "../types";

export class Invitation {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly token: string,
    public readonly role: UserRole,
    public readonly status: InvitationStatus,
    public readonly expiresAt: Date,
    public readonly invitedById: string,
    public readonly acceptedById: string | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    id: string,
    email: string,
    token: string,
    invitedById: string,
    expiresAt: Date,
    role: UserRole = UserRole.USER,
  ): Invitation {
    return new Invitation(
      id,
      email,
      token,
      role,
      InvitationStatus.PENDING,
      expiresAt,
      invitedById,
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isPending(): boolean {
    return this.status === InvitationStatus.PENDING && !this.isExpired();
  }

  accept(userId: string): Invitation {
    return new Invitation(
      this.id,
      this.email,
      this.token,
      this.role,
      InvitationStatus.ACCEPTED,
      this.expiresAt,
      this.invitedById,
      userId,
      this.createdAt,
      new Date(),
    );
  }

  revoke(): Invitation {
    return new Invitation(
      this.id,
      this.email,
      this.token,
      this.role,
      InvitationStatus.REVOKED,
      this.expiresAt,
      this.invitedById,
      this.acceptedById,
      this.createdAt,
      new Date(),
    );
  }
}
