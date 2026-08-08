import { notFound } from 'next/navigation'
import {
  getOrganization,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { MembersTabContent } from '@/widgets/organization-detail-tabs'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationMembersPage({ params }: PageProps) {
  const { id } = await params

  const [organizationResult, membersResult] = await Promise.all([
    getOrganization(id),
    getOrganizationMembers(id),
  ])

  if (!organizationResult.data) {
    notFound()
  }

  return (
    <MembersTabContent
      organization={organizationResult.data}
      initialMembers={membersResult.data ?? []}
      initialError={membersResult.error}
    />
  )
}
