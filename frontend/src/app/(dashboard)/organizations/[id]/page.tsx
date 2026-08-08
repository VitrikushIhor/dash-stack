import { notFound } from 'next/navigation'
import { getOrganization } from '@/entities/organization/server'
import { OverviewTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationOverviewPage({ params }: PageProps) {
  const { id } = await params
  const organizationResult = await getOrganization(id)

  if (!organizationResult.data) {
    notFound()
  }

  const organization = organizationResult.data
  const memberCount = organization.stats?.members ?? 0

  return (
    <OverviewTabContent organization={organization} memberCount={memberCount} />
  )
}
