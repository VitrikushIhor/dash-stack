'use client'

import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { useVerifyEmail } from '../model/hooks/use-verify-email'
import { VerificationStatus } from '../model/types/auth.types'

interface VerifyEmailCardProps {
  token?: string
}

export function VerifyEmailCard({ token }: VerifyEmailCardProps) {
  const {
    status,
    isLoading,
    isSuccess,
    isFailed,
    errorMessage,
    handleContinue,
  } = useVerifyEmail(token ?? null)

  return (
    <Card className='gap-4'>
      <CardHeader className='text-center'>
        <CardTitle className='text-lg tracking-tight'>
          Email Verification
        </CardTitle>
        <CardDescription>{getDescription(status)}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-4'>
        {isLoading && (
          <Loader2 className='text-primary h-12 w-12 animate-spin' />
        )}

        {isSuccess && (
          <>
            <CheckCircle2 className='h-12 w-12 text-green-500' />
            <p className='text-muted-foreground text-center text-sm'>
              Your account is now active. Redirecting you to sign in...
            </p>
            <Button onClick={handleContinue} className='mt-2'>
              Continue now
            </Button>
          </>
        )}

        {isFailed && (
          <>
            <XCircle className='text-destructive h-12 w-12' />
            <p className='text-muted-foreground text-center text-sm'>
              {errorMessage}
            </p>
            <Button variant='outline' onClick={handleContinue} className='mt-2'>
              Back to Sign In
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getDescription(status: VerificationStatus): string {
  switch (status) {
    case VerificationStatus.LOADING:
      return 'Verifying your email...'
    case VerificationStatus.SUCCESS:
      return 'Your email has been verified!'
    case VerificationStatus.ERROR:
    case VerificationStatus.MISSING_TOKEN:
    default:
      return 'Verification failed'
  }
}
