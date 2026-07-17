import { OrgRole } from '@prisma/client';

export interface PendingInvitationReadModel {
  id: string;
  email: string;
  role: OrgRole;
  orgId: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}
