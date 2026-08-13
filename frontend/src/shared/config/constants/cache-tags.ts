export const SERVER_CACHE_TAGS = {
  organizations: 'organizations',
  orgDetail: (id: string) => `organization-${id}`,
  orgMembers: (orgId: string) => `organization-members-${orgId}`,
  tasks: (orgId: string) => `tasks-${orgId}`,
  taskDetail: (id: string) => `task-${id}`,
  labels: (orgId: string) => `labels-${orgId}`,
} as const
