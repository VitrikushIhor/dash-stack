'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { useAcceptInvite } from '../model/mutations/use-accept-invite'

interface AcceptInvitePageProps {
  token?: string
}

const REDIRECT_DELAY = 2000

export const AcceptInvitePage = ({
  token: tokenProp,
}: AcceptInvitePageProps) => {
  const searchParams = useSearchParams()
  const token = tokenProp || searchParams.get('token') || ''
  const { mutate: acceptInvite, isPending, isError, error } = useAcceptInvite()
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (token) {
      acceptInvite(token, {
        onSuccess: () => {
          timeoutId = setTimeout(() => {
            router.push(ROUTES.organizations)
          }, REDIRECT_DELAY)
        },
      })
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [acceptInvite, router, token])

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-destructive text-center text-xl'>
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-center'>
            No invitation token provided.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            {isPending && 'Accepting Invitation...'}
            {isError && 'Invitation Failed'}
            {!isPending && !isError && 'Invitation Accepted!'}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-4 text-center'>
          {isPending && (
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
          )}
          {isError && (
            <p className='text-destructive text-sm'>
              {error?.message || 'Failed to accept invitation'}
            </p>
          )}
          {!isPending && !isError && (
            <p className='text-muted-foreground text-sm'>
              Redirecting you to dashboard...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
