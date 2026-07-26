'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { ResetPasswordForm } from '@/features/auth'

export function ResetPassword() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  if (!token) {
    return (
      <Card className='gap-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-lg tracking-tight'>Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <Button
            variant='outline'
            onClick={() => router.push('/forgot-password')}
          >
            Request New Link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='gap-4'>
      <CardHeader>
        <CardTitle className='text-lg tracking-tight'>Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  )
}
