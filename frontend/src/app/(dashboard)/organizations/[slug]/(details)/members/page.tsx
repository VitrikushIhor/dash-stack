import { notFound } from 'next/navigation'
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
  const orgResult = await getOrganizationBySlug(slug)

  if (!orgResult.data) {
    notFound()
  }

  const membersResult = await getOrganizationMembers(slug)

  return (
    <MembersTabContent
      organization={orgResult.data}
      initialMembers={membersResult.data ?? []}
      initialError={membersResult.error}
    />
  )
}
