'use client'

import { use } from 'react'
import { MemberDetailPage } from '@/views/organizations'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string; userId: string }>
}

export default function MemberDetailRoute({ params }: PageProps) {
  const resolvedParams = use(params)
  return (
    <MemberDetailPage
      orgId={resolvedParams.id}
      userId={resolvedParams.userId}
    />
  )
}
