import type { Metadata } from 'next'
import { OrganizationsPage } from '@/views/organizations'

export const metadata: Metadata = {
  title: 'Organizations | DashStack',
  description: 'Manage your organization workspaces and team members.',
}

export default function OrganizationsRoute() {
  return <OrganizationsPage />
}
