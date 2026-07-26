'use client'

import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { useVerifyEmail, VerificationStatus } from '@/features/auth'

export function VerifyEmail() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { status, errorMessage, handleContinue } = useVerifyEmail(token)

  return (
    <Card className='gap-4'>
      <CardHeader className='text-center'>
        <CardTitle className='text-lg tracking-tight'>
          Email Verification
        </CardTitle>
        <CardDescription>
          {status === VerificationStatus.LOADING && 'Verifying your email...'}
          {status === VerificationStatus.SUCCESS &&
            'Your email has been verified!'}
          {(status === VerificationStatus.ERROR ||
            status === VerificationStatus.MISSING_TOKEN) &&
            'Verification failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-4'>
        {status === VerificationStatus.LOADING && <LoadingState />}
        {status === VerificationStatus.SUCCESS && (
          <SuccessState onContinue={handleContinue} />
        )}
        {(status === VerificationStatus.ERROR ||
          status === VerificationStatus.MISSING_TOKEN) && (
          <ErrorState message={errorMessage} onBack={handleContinue} />
        )}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return <Loader2 className='text-primary h-12 w-12 animate-spin' />
}

function SuccessState({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <CheckCircle2 className='h-12 w-12 text-green-500' />
      <p className='text-muted-foreground text-center text-sm'>
        Your account is now active. Redirecting you to sign in...
      </p>
      <Button onClick={onContinue} className='mt-2'>
        Continue now
      </Button>
    </>
  )
}

function ErrorState({
  message,
  onBack,
}: {
  message: string
  onBack: () => void
}) {
  return (
    <>
      <XCircle className='text-destructive h-12 w-12' />
      <p className='text-muted-foreground text-center text-sm'>{message}</p>
      <Button variant='outline' onClick={onBack} className='mt-2'>
        Back to Sign In
      </Button>
    </>
  )
}
