import { OrgRole } from '@prisma/client';
import { OrganizationReadModel } from '../../application/read-models/organization.read-model';

interface PrismaOrganizationWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberships?: { role: OrgRole }[];
  _count?: {
    memberships: number;
    projects: number;
    calendarEvents: number;
  };
}

export class PrismaOrganizationMapper {
  static toReadModel(org: PrismaOrganizationWithCount | null): OrganizationReadModel | null {
    if (!org) return null;
    const { _count, memberships, ...rest } = org;

    return {
      ...rest,
      currentUserRole: memberships?.[0]?.role ?? null,
      stats: _count
        ? {
            members: _count.memberships,
            projects: _count.projects,
            events: _count.calendarEvents,
          }
        : undefined,
    };
  }
}
