import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ResolveTenantContextUseCase } from '../../application/use-cases/resolve-tenant-context.use-case';
import { TenantContextMissingException } from '../../domain/exceptions/tenant-context-missing.exception';

/**
 * Resolves the tenant context (Organization and Membership) from the route slug
 * and the authenticated user, attaching them to the request object.
 * This guard DOES NOT check roles. It only ensures the tenant exists and the user is a member.
 */
@Injectable()
export class ResolveTenantContextGuard implements CanActivate {
  constructor(private readonly resolveTenantContextUseCase: ResolveTenantContextUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const slug = request.params.slug;
    const userId = request.user?.id;

    if (!slug || !userId) {
      throw new TenantContextMissingException();
    }

    if (request.tenantContext) {
      return true;
    }

    const tenantContext = await this.resolveTenantContextUseCase.execute(slug, userId);

    request.tenantContext = tenantContext;
    request.orgId = tenantContext.organization.id;
    request.organization = tenantContext.organization;
    request.membership = tenantContext.membership;

    return true;
  }
}
