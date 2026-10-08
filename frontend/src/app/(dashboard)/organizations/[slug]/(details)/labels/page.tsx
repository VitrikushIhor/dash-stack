import { PageErrorHandler } from '@/shared/ui/error-state'
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
  const [orgResult, labelsResult] = await Promise.all([
    getOrganizationBySlug(slug),
    getOrganizationLabels(slug),
  ])

  if (!orgResult.ok) {
    return <PageErrorHandler error={orgResult.error} withContainer={false} />
  }

  if (!labelsResult.ok) {
    return <PageErrorHandler error={labelsResult.error} withContainer={false} />
  }

  return <LabelsTabContent slug={slug} labels={labelsResult.data} />
}
