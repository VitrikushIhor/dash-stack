export const ORGANIZATION_ERRORS = {
  NOT_FOUND: (id: string) => `Organization with ID ${id} not found`,
  MEMBER_NOT_FOUND: (orgId: string, userId: string) =>
    `Member with user ID ${userId} not found in organization ${orgId}`,
} as const;
