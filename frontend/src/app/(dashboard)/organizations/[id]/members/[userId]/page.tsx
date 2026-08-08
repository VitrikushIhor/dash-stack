import type { Metadata } from 'next'
import { MemberDetailPage } from '@/views/organizations'

interface PageProps {
  params: Promise<{ id: string; userId: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Member Details | DashStack',
    description: 'View organization member profile and permissions.',
  }
}

export default async function MemberDetailRoute({ params }: PageProps) {
  const { id, userId } = await params
  return <MemberDetailPage orgId={id} userId={userId} />
}
