import { notFound } from 'next/navigation'
import type { LabelDto } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'
import { getOrganization } from '@/entities/organization/server'
import { LabelsTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationLabelsPage({ params }: PageProps) {
  const { id } = await params

  const [organizationResult, labels] = await Promise.all([
    getOrganization(id),
    labelServerApi.findAll(id).catch(() => [] as LabelDto[]),
  ])

  if (!organizationResult.data) {
    notFound()
  }

  return <LabelsTabContent labels={labels} />
}
