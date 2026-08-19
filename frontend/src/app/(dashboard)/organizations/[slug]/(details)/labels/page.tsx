import { notFound } from 'next/navigation'
import { getOrganizationLabels } from '@/entities/label/server'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { LabelsTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationLabelsPage({ params }: PageProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (!orgResult.data) {
    notFound()
  }

  const labelsResult = await getOrganizationLabels(slug)

  return <LabelsTabContent slug={slug} labels={labelsResult.data || []} />
}
