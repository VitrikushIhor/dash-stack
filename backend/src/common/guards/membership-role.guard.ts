import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole } from '@prisma/client';

export const ORG_ROLES_KEY = 'orgRoles';
export const RequireOrgRole = (...roles: OrgRole[]) =>
  SetMetadata(ORG_ROLES_KEY, roles);

const roleHierarchy: Record<OrgRole, number> = {
  [OrgRole.OWNER]: 4,
  [OrgRole.ADMIN]: 3,
  [OrgRole.MEMBER]: 2,
  [OrgRole.GUEST]: 1,
};

@Injectable()
export class MembershipRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(
      ORG_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { membership } = context.switchToHttp().getRequest();

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    const minRequiredRoleValue = Math.min(
      ...requiredRoles.map((role) => roleHierarchy[role]),
    );
    const userRoleValue = roleHierarchy[membership.role as OrgRole];

    if (userRoleValue >= minRequiredRoleValue) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
