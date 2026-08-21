import { notFound } from 'next/navigation'
import { getOrganizationBySlug } from '@/entities/organization/server'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (orgResult.error || !orgResult.data) {
    notFound()
  }

  return <>{children}</>
}
