'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants/routes'
import { Button } from '@/shared/ui/core/button'

export function UnauthorisedError() {
  const router = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>Unauthorized Access</span>
        <p className='text-muted-foreground text-center'>
          Please log in with the appropriate credentials <br /> to access this
          resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push(ROUTES.signIn)}>Sign In</Button>
        </div>
      </div>
    </div>
  )
}
