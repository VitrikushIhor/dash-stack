import { notFound } from 'next/navigation'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { Main } from '@/widgets/layout'
import { OrganizationTabsNav } from '@/widgets/organization-detail-tabs'
import { OrganizationDetailHeader } from '@/views/organizations'

interface DetailLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationDetailLayout({
  children,
  params,
}: DetailLayoutProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (!orgResult.data) {
    notFound()
  }

  return (
    <Main className='space-y-6'>
      <OrganizationDetailHeader organization={orgResult.data} />
      <OrganizationTabsNav slug={slug} />
      {children}
    </Main>
  )
}
