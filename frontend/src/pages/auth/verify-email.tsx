import { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { getErrorMessage } from '@/shared/api/api-helpers'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import { AuthLayout, useVerifyEmail } from '@/features/auth'
import { VerificationStatus } from '@/features/auth/model/types/auth.types'

export function VerifyEmail() {
  const searchParams = useSearch({ strict: false }) as { token?: string }
  const token = searchParams.token
  const navigate = useNavigate()
  const verifyMutation = useVerifyEmail()
  const hasTriedRef = useRef(false)

  useEffect(() => {
    if (token && !hasTriedRef.current) {
      hasTriedRef.current = true
      verifyMutation.mutate(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const status = verifyMutation.isPending
    ? VerificationStatus.LOADING
    : verifyMutation.isSuccess
      ? VerificationStatus.SUCCESS
      : verifyMutation.isError
        ? VerificationStatus.ERROR
        : !token
          ? VerificationStatus.ERROR
          : VerificationStatus.LOADING

  const errorMessage = verifyMutation.error
    ? getErrorMessage(verifyMutation.error)
    : 'No verification token provided'

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-lg tracking-tight'>
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === VerificationStatus.LOADING && 'Verifying your email...'}
            {status === VerificationStatus.SUCCESS &&
              'Your email has been verified!'}
            {status === VerificationStatus.ERROR && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-4'>
          {status === VerificationStatus.LOADING && (
            <Loader2 className='text-primary h-12 w-12 animate-spin' />
          )}

          {status === VerificationStatus.SUCCESS && (
            <>
              <CheckCircle2 className='h-12 w-12 text-green-500' />
              <p className='text-muted-foreground text-center text-sm'>
                Your account is now active. You can start using the application.
              </p>
              <Button onClick={() => navigate({ to: '/' })} className='mt-2'>
                Go to Dashboard
              </Button>
            </>
          )}

          {status === VerificationStatus.ERROR && (
            <>
              <XCircle className='text-destructive h-12 w-12' />
              <p className='text-muted-foreground text-center text-sm'>
                {errorMessage}
              </p>
              <Button
                variant='outline'
                onClick={() => navigate({ to: '/sign-in' })}
                className='mt-2'
              >
                Back to Sign In
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
