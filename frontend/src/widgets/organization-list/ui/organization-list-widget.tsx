import { WidgetErrorState } from '@/shared/ui/feedback'
import { getUserOrganizations } from '@/entities/organization/server'
import { OrganizationEmptyState } from './organization-empty-state'
import { OrganizationGrid } from './organization-grid'

export async function OrganizationListWidget() {
  const result = await getUserOrganizations()

  if (!result.ok) {
    return (
      <WidgetErrorState
        title='Failed to load organizations'
        description={result.error.message}
      />
    )
  }

  if (result.data.length === 0) {
    return <OrganizationEmptyState />
  }

  return <OrganizationGrid memberships={result.data} />
}
