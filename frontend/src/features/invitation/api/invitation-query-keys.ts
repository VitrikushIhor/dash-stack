export const invitationKeys = {
  all: ['invitations'] as const,
  orgList: (orgId: string) => [...invitationKeys.all, 'org', orgId] as const,
}
