import { PageErrorHandler } from '@/shared/ui/error-state'
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

  if (!orgResult.ok) {
    return <PageErrorHandler error={orgResult.error} />
  }

  return <>{children}</>
}
