import { OrgRole } from '@prisma/client';
import { PendingInvitationReadModel } from '../read-models/pending-invitation.read-model';

export interface CreateInvitationData {
  email: string;
  role: OrgRole;
  orgId: string;
  invitedBy: string;
  expiresAt: Date;
}

export interface InvitationRepositoryPort {
  findMembershipByEmailAndOrg(
    email: string,
    orgId: string,
  ): Promise<unknown | null>;

  findPendingByEmailAndOrg(
    email: string,
    orgId: string,
  ): Promise<unknown | null>;

  findOrgById(orgId: string): Promise<{ name: string } | null>;

  findByToken(token: string): Promise<PendingInvitationReadModel | null>;

  findById(id: string): Promise<PendingInvitationReadModel | null>;

  create(data: CreateInvitationData): Promise<PendingInvitationReadModel>;

  accept(
    invitationId: string,
    userId: string,
    orgId: string,
    role: OrgRole,
  ): Promise<unknown>;

  listPending(orgId: string): Promise<PendingInvitationReadModel[]>;

  delete(id: string): Promise<void>;
}
