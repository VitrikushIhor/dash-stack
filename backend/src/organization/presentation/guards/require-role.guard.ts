import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole } from '../../domain/enums/org-role.enum';
import { ORG_ROLES_KEY, ROLE_HIERARCHY } from '../../domain/constants/role.constants';
import { InsufficientOrganizationPermissionsException } from '../../domain/exceptions/insufficient-organization-permissions.exception';
import { TenantContextMissingException } from '../../domain/exceptions/tenant-context-missing.exception';

/**
 * Checks if the user's resolved tenant role satisfies the required role.
 * Relies on ResolveTenantContextGuard to have populated request.tenantContext.
 */
@Injectable()
export class RequireRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    if (!tenantContext || !tenantContext.membership) {
      throw new TenantContextMissingException();
    }

    const minRequiredRoleValue = Math.min(...requiredRoles.map((role) => ROLE_HIERARCHY[role]));
    const userRoleValue = ROLE_HIERARCHY[tenantContext.membership.role as OrgRole];

    if (userRoleValue === undefined) {
      throw new TenantContextMissingException();
    }

    if (userRoleValue >= minRequiredRoleValue) {
      return true;
    }

    throw new InsufficientOrganizationPermissionsException();
  }
}
