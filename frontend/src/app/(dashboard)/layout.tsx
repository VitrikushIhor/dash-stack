import { AuthenticatedLayout } from '@/widgets/layout'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
