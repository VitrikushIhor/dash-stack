import { OrgRole } from '../../domain/enums/org-role.enum';

export interface TenantContextReadModel {
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  membership: {
    id: string;
    role: OrgRole;
    userId: string;
    orgId: string;
    joinedAt: Date;
  };
}
