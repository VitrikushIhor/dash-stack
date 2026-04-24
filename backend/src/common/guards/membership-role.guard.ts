import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole } from '@prisma/client';

import { PrismaService } from 'nestjs-prisma';

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
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(
      ORG_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const orgId = request.params.orgId;
    const userId = request.user?.id;

    if (!orgId || !userId) {
      throw new ForbiddenException('Organization ID or User ID missing');
    }

    // Fetch membership if not already attached by middleware (though middleware might be removed)
    let membership = request.membership;

    if (!membership) {
      membership = await this.prisma.membership.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
      });
      // Attach to request for potential reuse in controllers
      request.membership = membership;
    }

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
