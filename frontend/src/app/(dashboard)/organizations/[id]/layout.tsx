import { notFound } from 'next/navigation'
import { getOrganization } from '@/entities/organization/server'
import { Main } from '@/widgets/layout'
import { OrganizationTabsNav } from '@/widgets/organization-detail-tabs'
import { OrganizationDetailHeader } from '@/views/organizations'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params
  const organizationResult = await getOrganization(id)

  if (!organizationResult.data) {
    notFound()
  }

  return (
    <Main className='space-y-6'>
      <OrganizationDetailHeader organization={organizationResult.data} />
      <OrganizationTabsNav orgId={id} />
      {children}
    </Main>
  )
}
