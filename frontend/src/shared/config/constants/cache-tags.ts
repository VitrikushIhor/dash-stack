export const SERVER_CACHE_TAGS = {
  organizations: 'organizations',
  orgDetail: (id: string) => `organization-${id}`,
  orgMembers: (orgId: string) => `organization-members-${orgId}`,
  tasks: 'tasks',
  taskDetail: (id: string) => `task-${id}`,
} as const
