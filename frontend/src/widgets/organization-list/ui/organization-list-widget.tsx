import { WidgetErrorState } from '@/shared/ui/feedback'
import { getUserOrganizations } from '@/entities/organization/server'
import { OrganizationEmptyState } from './organization-empty-state'
import { OrganizationGrid } from './organization-grid'

export async function OrganizationListWidget() {
  const { data: memberships, error } = await getUserOrganizations()

  if (error) {
    return (
      <WidgetErrorState
        title='Failed to load organizations'
        description={error}
      />
    )
  }

  if (!memberships || memberships.length === 0) {
    return <OrganizationEmptyState />
  }

  return <OrganizationGrid memberships={memberships} />
}
