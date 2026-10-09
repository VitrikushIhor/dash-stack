import { PageErrorHandler } from '@/shared/ui/error-state'
import {
  getOrganizationBySlug,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { MembersTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationMembersPage({ params }: PageProps) {
  const { slug } = await params
  const [orgResult, membersResult] = await Promise.all([
    getOrganizationBySlug(slug),
    getOrganizationMembers(slug),
  ])

  if (!orgResult.ok) {
    return <PageErrorHandler error={orgResult.error} withContainer={false} />
  }

  if (!membersResult.ok) {
    return (
      <PageErrorHandler error={membersResult.error} withContainer={false} />
    )
  }

  return (
    <MembersTabContent
      organization={orgResult.data}
      initialMembers={membersResult.data}
    />
  )
}
