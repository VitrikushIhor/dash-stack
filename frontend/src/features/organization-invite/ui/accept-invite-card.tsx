'use client'

import { CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import {
  useAcceptInviteFlow,
  type AcceptInviteFlowStatus,
} from '../model/use-accept-invite-flow'

interface AcceptInviteCardProps {
  token?: string
}

export function AcceptInviteCard({ token }: AcceptInviteCardProps) {
  const {
    status,
    isLoading,
    isSuccess,
    isFailed,
    errorMessage,
    handleContinue,
    handleRetry,
  } = useAcceptInviteFlow(token ?? null)

  return (
    <Card className='gap-4'>
      <CardHeader className='text-center'>
        <CardTitle className='text-lg tracking-tight'>
          Accept Invitation
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
              You have joined the organization. Redirecting to organizations...
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
            <div className='mt-2 flex items-center gap-2'>
              {handleRetry && (
                <Button onClick={handleRetry} className='gap-2'>
                  <RotateCcw className='h-4 w-4' />
                  Try again
                </Button>
              )}
              <Button variant='outline' onClick={handleContinue}>
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getDescription(status: AcceptInviteFlowStatus): string {
  switch (status) {
    case 'loading':
      return 'Accepting your invitation...'
    case 'success':
      return 'Your invitation has been accepted!'
    case 'error':
    default:
      return 'Invitation could not be accepted'
  }
}
