import { notFound } from 'next/navigation'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { SettingsTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (!orgResult.data) {
    notFound()
  }

  return <SettingsTabContent organization={orgResult.data} />
}
