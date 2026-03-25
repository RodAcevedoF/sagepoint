import type { Invitation } from "../entities/invitation.entity";

export const INVITATION_REPOSITORY = "INVITATION_REPOSITORY";

export interface IInvitationRepository {
  save(invitation: Invitation): Promise<void>;
  findById(id: string): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  findPendingByEmail(email: string): Promise<Invitation | null>;
  findAll(): Promise<Invitation[]>;
}
