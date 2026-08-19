import { OrganizationReadModel } from '../../application/read-models/organization.read-model';
import { TenantContextReadModel } from '../../application/read-models/tenant-context.read-model';
import { OrgRole as PrismaOrgRole } from '@prisma/client';
import { PrismaOrgRoleMapper } from './mappers/org-role.mapper';

interface PrismaOrganizationWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberships?: { role: PrismaOrgRole }[];
  _count?: {
    memberships: number;
    projects: number;
    calendarEvents: number;
  };
}

interface PrismaMembershipWithOrg {
  id: string;
  userId: string;
  orgId: string;
  role: PrismaOrgRole;
  joinedAt: Date;
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class PrismaOrganizationMapper {
  static toReadModel(org: PrismaOrganizationWithCount | null): OrganizationReadModel | null {
    if (!org) return null;
    const { _count, memberships, ...rest } = org;

    return {
      ...rest,
      currentUserRole: memberships?.[0]?.role
        ? PrismaOrgRoleMapper.toDomain(memberships[0].role)
        : null,
      stats: _count
        ? {
            members: _count.memberships,
            projects: _count.projects,
            events: _count.calendarEvents,
          }
        : undefined,
    };
  }

  static toTenantContext(membership: PrismaMembershipWithOrg): TenantContextReadModel {
    const { organization, ...rest } = membership;
    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        logo: organization.logo,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      membership: {
        id: rest.id,
        userId: rest.userId,
        orgId: rest.orgId,
        role: PrismaOrgRoleMapper.toDomain(rest.role),
        joinedAt: rest.joinedAt,
      },
    };
  }
}
