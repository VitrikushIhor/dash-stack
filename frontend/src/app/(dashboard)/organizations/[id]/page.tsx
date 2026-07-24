'use client'

import { use } from 'react'
import { OrganizationDetailPage } from '@/views/organizations'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationDetailRoute({ params }: PageProps) {
  const resolvedParams = use(params)
  return <OrganizationDetailPage orgId={resolvedParams.id} />
}
