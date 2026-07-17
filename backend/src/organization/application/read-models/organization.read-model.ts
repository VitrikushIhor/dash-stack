import { OrgRole } from '@prisma/client';

export interface OrganizationReadModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  currentUserRole?: OrgRole | null;
  stats?: {
    members: number;
    projects: number;
    events: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
