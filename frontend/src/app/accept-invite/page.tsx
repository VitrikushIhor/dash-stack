import { Suspense } from 'react'
import { AcceptInvitePage } from '@/features/invitation'

export const dynamic = 'force-dynamic'

export default function AcceptInviteRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6 text-center'>
          Loading invitation...
        </div>
      }
    >
      <AcceptInvitePage />
    </Suspense>
  )
}
