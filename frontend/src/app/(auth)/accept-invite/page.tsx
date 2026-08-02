import { AcceptInviteCard } from '@/features/invitation'

interface AcceptInviteRouteProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInviteRoute({
  searchParams,
}: AcceptInviteRouteProps) {
  const { token } = await searchParams

  return <AcceptInviteCard token={token} />
}
