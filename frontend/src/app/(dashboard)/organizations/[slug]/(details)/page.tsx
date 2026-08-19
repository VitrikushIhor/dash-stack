import { notFound } from 'next/navigation'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { OverviewTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationOverviewPage({ params }: PageProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (!orgResult.data) {
    notFound()
  }

  const organization = orgResult.data
  const memberCount = organization.stats?.members ?? 0

  return (
    <OverviewTabContent organization={organization} memberCount={memberCount} />
  )
}
