import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContextReadModel } from '../../application/read-models/tenant-context.read-model';
import { TenantContextMissingException } from '../../domain/exceptions/tenant-context-missing.exception';

/**
 * Extracts the canonical CUID orgId resolved by ResolveTenantContextGuard.
 * Provides explicit naming for controllers receiving the slug in the URL.
 */
export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.tenantContext) {
    throw new TenantContextMissingException();
  }
  return request.tenantContext.organization.id;
});

/**
 * Extracts the full Organization entity attached to the request's tenant context.
 */
export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContextReadModel['organization'] => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.tenantContext) {
      throw new TenantContextMissingException();
    }
    return request.tenantContext.organization;
  },
);

/**
 * Extracts the current user's Membership entity attached to the request's tenant context.
 */
export const TenantMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContextReadModel['membership'] => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.tenantContext) {
      throw new TenantContextMissingException();
    }
    return request.tenantContext.membership;
  },
);
