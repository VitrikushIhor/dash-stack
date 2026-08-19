import { getUserOrganizations } from '@/entities/organization/server'
import { NoOrganizationFallback } from './no-organization-fallback'
import { TeamSwitcherUI } from './team-switcher-ui'

export async function TeamSwitcher() {
  const { data: memberships } = await getUserOrganizations()

  if (!memberships?.length) return <NoOrganizationFallback />

  const activeOrg = memberships[0].organization

  return <TeamSwitcherUI activeOrg={activeOrg} memberships={memberships} />
}
