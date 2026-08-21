import { OrgRole } from '../../../organization/domain/enums/org-role.enum';

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
