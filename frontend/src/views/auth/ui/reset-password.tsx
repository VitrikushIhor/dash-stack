import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { ResetPasswordForm } from '@/features/auth'

interface ResetPasswordProps {
  token?: string
}

export function ResetPassword({ token }: ResetPasswordProps) {
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
          <Button variant='outline' asChild>
            <Link href={ROUTES.forgotPassword}>Request New Link</Link>
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
