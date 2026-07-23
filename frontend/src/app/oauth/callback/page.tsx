'use client'

import { Suspense } from 'react'
import { OAuthCallback } from '@/views/auth'

export const dynamic = 'force-dynamic'

export default function OAuthCallbackRoute() {
  return (
    <Suspense
      fallback={
        <div className='text-muted-foreground p-6 text-center'>
          Authenticating...
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  )
}
