import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { OrgRole } from '../../domain/enums/org-role.enum';
import { ResolveTenantContextGuard } from '../guards/resolve-tenant-context.guard';
import { RequireRoleGuard } from '../guards/require-role.guard';
import { ORG_ROLES_KEY } from '../../domain/constants/role.constants';

/**
 * Composite decorator that:
 * 1. Requires the specified roles (e.g., OWNER, ADMIN)
 * 2. Applies the ResolveTenantContextGuard to resolve the org + membership
 * 3. Applies the RequireRoleGuard to check the required roles against the membership
 */
export function RequireTenantRole(...roles: OrgRole[]) {
  return applyDecorators(
    SetMetadata(ORG_ROLES_KEY, roles),
    UseGuards(ResolveTenantContextGuard, RequireRoleGuard),
  );
}
