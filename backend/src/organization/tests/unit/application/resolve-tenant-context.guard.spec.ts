import { ExecutionContext } from '@nestjs/common';
import { ResolveTenantContextGuard } from '../../../presentation/guards/resolve-tenant-context.guard';
import { ResolveTenantContextUseCase } from '../../../application/use-cases/resolve-tenant-context.use-case';
import { TenantContextMissingException } from '../../../domain/exceptions/tenant-context-missing.exception';
import { OrganizationNotFoundBySlugException } from '../../../domain/exceptions/organization-not-found-by-slug.exception';
import { TenantContextReadModel } from '../../../application/read-models/tenant-context.read-model';
import { OrgRole } from '../../../domain/enums/org-role.enum';

const mockTenantContext = (
  overrides: Partial<TenantContextReadModel> = {},
): TenantContextReadModel => ({
  organization: {
    id: 'org-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: null,
    logo: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  membership: {
    id: 'membership-1',
    userId: 'user-1',
    orgId: 'org-1',
    role: OrgRole.MEMBER,
    joinedAt: new Date('2024-01-01'),
  },
  ...overrides,
});

function createMockContext(
  params: Record<string, string>,
  user?: { id: string },
  tenantContext?: TenantContextReadModel,
): ExecutionContext {
  const request: Record<string, unknown> = { params, user };
  if (tenantContext) request.tenantContext = tenantContext;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('ResolveTenantContextGuard', () => {
  let guard: ResolveTenantContextGuard;
  let resolveTenantContextUseCase: jest.Mocked<ResolveTenantContextUseCase>;

  beforeEach(() => {
    resolveTenantContextUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveTenantContextUseCase>;

    guard = new ResolveTenantContextGuard(resolveTenantContextUseCase);
  });

  it('resolves tenant context and attaches it to the request for valid slug and user', async () => {
    const context = mockTenantContext();
    resolveTenantContextUseCase.execute.mockResolvedValue(context);

    const request: Record<string, unknown> = {
      params: { slug: 'acme-corp' },
      user: { id: 'user-1' },
    };
    const executionContext = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(executionContext);

    expect(result).toBe(true);
    expect(resolveTenantContextUseCase.execute).toHaveBeenCalledWith('acme-corp', 'user-1');
    expect(request.tenantContext).toEqual(context);
    expect(request.orgId).toBe('org-1');
    expect(request.organization).toEqual(context.organization);
    expect(request.membership).toEqual(context.membership);
  });

  it('throws TenantContextMissingException when slug is absent', async () => {
    const ctx = createMockContext({}, { id: 'user-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(TenantContextMissingException);
    expect(resolveTenantContextUseCase.execute).not.toHaveBeenCalled();
  });

  it('throws TenantContextMissingException when user is unauthenticated', async () => {
    const ctx = createMockContext({ slug: 'acme-corp' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(TenantContextMissingException);
    expect(resolveTenantContextUseCase.execute).not.toHaveBeenCalled();
  });

  it('propagates OrganizationNotFoundBySlugException for unknown or unauthorized slug', async () => {
    resolveTenantContextUseCase.execute.mockRejectedValue(
      new OrganizationNotFoundBySlugException('unknown-slug'),
    );
    const ctx = createMockContext({ slug: 'unknown-slug' }, { id: 'user-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(OrganizationNotFoundBySlugException);
  });

  it('returns true and skips use case when tenantContext is already present on request', async () => {
    const tenantCtx = mockTenantContext();
    const ctx = createMockContext({ slug: 'acme-corp' }, { id: 'user-1' }, tenantCtx);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(resolveTenantContextUseCase.execute).not.toHaveBeenCalled();
  });
});
