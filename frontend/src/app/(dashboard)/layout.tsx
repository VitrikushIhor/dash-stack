import { cookies } from 'next/headers'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import type {
  Collapsible,
  Variant,
} from '@/shared/lib/providers/layout-provider'
import { ensureHasOrganization } from '@/entities/organization/server'
import { AuthenticatedLayout } from '@/widgets/layout'

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await ensureHasOrganization()

  const cookieStore = await cookies()
  const defaultOpen =
    cookieStore.get(COOKIE_CONFIG.SIDEBAR_STATE.name)?.value !== 'false'
  const defaultCollapsible = (cookieStore.get(
    COOKIE_CONFIG.LAYOUT_COLLAPSIBLE.name
  )?.value || 'icon') as Collapsible
  const defaultVariant = (cookieStore.get(COOKIE_CONFIG.LAYOUT_VARIANT.name)
    ?.value || 'inset') as Variant

  return (
    <AuthenticatedLayout
      defaultOpen={defaultOpen}
      defaultCollapsible={defaultCollapsible}
      defaultVariant={defaultVariant}
    >
      {children}
    </AuthenticatedLayout>
  )
}
