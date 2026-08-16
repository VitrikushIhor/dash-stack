import { notFound } from 'next/navigation'
import { getOrganization } from '@/entities/organization/server'
import { SettingsTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const { id } = await params
  const organizationResult = await getOrganization(id)

  if (!organizationResult.data) {
    notFound()
  }

  return <SettingsTabContent organization={organizationResult.data} />
}
