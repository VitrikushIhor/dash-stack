import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequireRoleGuard } from '../../../presentation/guards/require-role.guard';
import { TenantContextMissingException } from '../../../domain/exceptions/tenant-context-missing.exception';
import { InsufficientOrganizationPermissionsException } from '../../../domain/exceptions/insufficient-organization-permissions.exception';
import { TenantContextReadModel } from '../../../application/read-models/tenant-context.read-model';
import { OrgRole } from '../../../domain/enums/org-role.enum';

function createMockContext(tenantContext?: TenantContextReadModel): ExecutionContext {
  const request: Record<string, unknown> = {};
  if (tenantContext) {
    request.tenantContext = tenantContext;
  }

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

const mockTenantContext = (role: OrgRole): TenantContextReadModel => ({
  organization: {
    id: 'org-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: null,
    logo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  membership: {
    id: 'mem-1',
    userId: 'user-1',
    orgId: 'org-1',
    role,
    joinedAt: new Date(),
  },
});

describe('RequireRoleGuard', () => {
  let guard: RequireRoleGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RequireRoleGuard(reflector);
  });

  it('returns true if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext();

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws TenantContextMissingException if tenantContext is not present in request', () => {
    reflector.getAllAndOverride.mockReturnValue([OrgRole.MEMBER]);
    const ctx = createMockContext();

    expect(() => guard.canActivate(ctx)).toThrow(TenantContextMissingException);
  });

  it('allows access if user has sufficient role (exact match)', () => {
    reflector.getAllAndOverride.mockReturnValue([OrgRole.ADMIN]);
    const ctx = createMockContext(mockTenantContext(OrgRole.ADMIN));

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access if user has a higher role', () => {
    reflector.getAllAndOverride.mockReturnValue([OrgRole.MEMBER]);
    const ctx = createMockContext(mockTenantContext(OrgRole.ADMIN)); // ADMIN > MEMBER

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws InsufficientOrganizationPermissionsException if user role is too low', () => {
    reflector.getAllAndOverride.mockReturnValue([OrgRole.ADMIN]);
    const ctx = createMockContext(mockTenantContext(OrgRole.MEMBER)); // MEMBER < ADMIN

    expect(() => guard.canActivate(ctx)).toThrow(InsufficientOrganizationPermissionsException);
  });

  it('throws TenantContextMissingException if user has an invalid/unmapped role', () => {
    reflector.getAllAndOverride.mockReturnValue([OrgRole.GUEST]);
    const ctx = createMockContext(mockTenantContext('UNKNOWN_ROLE' as OrgRole));

    expect(() => guard.canActivate(ctx)).toThrow(TenantContextMissingException);
  });
});
