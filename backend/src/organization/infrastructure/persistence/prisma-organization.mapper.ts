import { OrganizationReadModel } from '../../application/read-models/organization.read-model';

interface PrismaOrganizationWithCount {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    memberships: number;
    projects: number;
    calendarEvents: number;
  };
}

export class PrismaOrganizationMapper {
  static toReadModel(
    org: PrismaOrganizationWithCount | null,
  ): OrganizationReadModel | null {
    if (!org) return null;
    const { _count, ...rest } = org;

    return {
      ...rest,
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
