import { Suspense } from 'react'
import { VerifyEmail } from '@/views/auth'

export const dynamic = 'force-dynamic'

export default function VerifyEmailRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6 text-center'>Loading...</div>
      }
    >
      <VerifyEmail />
    </Suspense>
  )
}
