import { getActiveOrganization } from '@/entities/organization/server'
import { NoOrganizationFallback } from './no-organization-fallback'
import { TeamSwitcherUI } from './team-switcher-ui'

export async function TeamSwitcher() {
  const { activeOrg, memberships } = await getActiveOrganization()

  if (!memberships?.length || !activeOrg) return <NoOrganizationFallback />

  return <TeamSwitcherUI activeOrg={activeOrg} memberships={memberships} />
}
