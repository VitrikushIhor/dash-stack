import { OrgRole } from '@prisma/client';

export interface SendInviteCommand {
  email: string;
  role: OrgRole;
}
