import { OrgRole } from '../../../organization/domain/enums/org-role.enum';

export interface UserMembershipReadModel {
  role: OrgRole;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
}
