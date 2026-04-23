import { OrgRole } from '@prisma/client';

export interface CreateInvitationData {
  email: string;
  role: OrgRole;
  orgId: string;
  invitedBy: string;
  expiresAt: Date;
}
