import { OrgRole as DomainOrgRole } from '../../../domain/enums/org-role.enum';
import { OrgRole as PrismaOrgRole } from '@prisma/client';

export class PrismaOrgRoleMapper {
  private static readonly roleMap: Record<PrismaOrgRole, DomainOrgRole> = {
    OWNER: DomainOrgRole.OWNER,
    ADMIN: DomainOrgRole.ADMIN,
    MEMBER: DomainOrgRole.MEMBER,
    GUEST: DomainOrgRole.GUEST,
  };

  static toDomain(role: PrismaOrgRole): DomainOrgRole {
    return this.roleMap[role];
  }
}
