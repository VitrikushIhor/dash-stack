import { WidgetErrorState } from '@/shared/ui/feedback'
import { getUserOrganizations } from '@/entities/organization/server'
import { NoOrganizationFallback } from './no-organization-fallback'
import { TeamSwitcherUI } from './team-switcher-ui'

export async function TeamSwitcher() {
  const result = await getUserOrganizations()

  if (!result.ok) {
    return (
      <WidgetErrorState
        title='Failed to load organizations'
        description={result.error.message}
      />
    )
  }

  if (!result.data.length) return <NoOrganizationFallback />

  const activeOrg = result.data[0].organization

  return <TeamSwitcherUI activeOrg={activeOrg} memberships={result.data} />
}
