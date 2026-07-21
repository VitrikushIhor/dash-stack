import { Suspense } from 'react'
import { ResetPassword } from '@/views/auth'

export const dynamic = 'force-dynamic'

export default function ResetPasswordRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6 text-center'>Loading...</div>
      }
    >
      <ResetPassword />
    </Suspense>
  )
}
