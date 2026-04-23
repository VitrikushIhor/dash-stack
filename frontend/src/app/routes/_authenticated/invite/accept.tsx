import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitePage } from '@/features/invitation'

const acceptInviteSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/invite/accept')({
  validateSearch: (search) => acceptInviteSearchSchema.parse(search),
  component: AcceptInviteRoute,
})

function AcceptInviteRoute() {
  const { token } = Route.useSearch()

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center py-20 text-center'>
        <div className='space-y-4'>
          <h1 className='text-destructive text-2xl font-bold'>
            Invalid Invitation
          </h1>
          <p className='text-muted-foreground'>
            The invitation link is missing a token.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-20'>
      <AcceptInvitePage token={token} />
    </div>
  )
}
