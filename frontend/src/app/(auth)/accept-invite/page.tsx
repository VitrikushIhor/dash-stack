import { AcceptInviteCard } from '@/features/organization-invite'

interface AcceptInviteRouteProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInviteRoute({
  searchParams,
}: AcceptInviteRouteProps) {
  const { token } = await searchParams

  return <AcceptInviteCard token={token} />
}
