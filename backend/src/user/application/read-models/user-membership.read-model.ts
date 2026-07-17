import { OrgRole } from '@prisma/client';

export interface UserMembershipReadModel {
  role: OrgRole;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
}
