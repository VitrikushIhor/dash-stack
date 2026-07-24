'use client'

import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { AuthLayout, useOAuthCallback } from '@/features/auth'

export function OAuthCallback() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useOAuthCallback({ code, error })

  return (
    <AuthLayout>
      <Card className='gap-4 text-center'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Authenticating...
          </CardTitle>
          <CardDescription>Completing sign in, please wait.</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <Loader2 className='text-primary h-12 w-12 animate-spin' />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
