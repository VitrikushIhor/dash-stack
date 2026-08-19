export const ORGANIZATION_ERRORS = {
  NOT_FOUND: (id: string) => `Organization with ID ${id} not found`,
  NOT_FOUND_BY_SLUG: (slug: string) =>
    `Organization with slug ${slug} not found or you don't have access`,
  MEMBER_NOT_FOUND: (orgId: string, userId: string) =>
    `Member with user ID ${userId} not found in organization ${orgId}`,
  INSUFFICIENT_PERMISSIONS: () => `Insufficient permissions in this organization`,
  TENANT_CONTEXT_MISSING: () =>
    `Tenant context not resolved. Is ResolveTenantContextGuard applied?`,
} as const;
