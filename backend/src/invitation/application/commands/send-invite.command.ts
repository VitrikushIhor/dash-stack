import { OrgRole } from '../../../organization/domain/enums/org-role.enum';

export interface SendInviteCommand {
  email: string;
  role: OrgRole;
}
