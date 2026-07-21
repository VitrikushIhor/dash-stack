import { Suspense } from 'react'
import { SignIn } from '@/views/auth'

export const dynamic = 'force-dynamic'

export default function SignInRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6 text-center'>Loading...</div>
      }
    >
      <SignIn />
    </Suspense>
  )
}
