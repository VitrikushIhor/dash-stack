import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import { useAcceptInvite } from '../api/hooks/use-accept-invite'

interface AcceptInvitePageProps {
  token: string
}

const REDIRECT_DELAY = 2000

export const AcceptInvitePage = ({ token }: AcceptInvitePageProps) => {
  const { mutate: acceptInvite, isPending, isError, error } = useAcceptInvite()
  const navigate = useNavigate()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (token) {
      acceptInvite(token, {
        onSuccess: () => {
          // Redirect to organizations list after success
          timeoutId = setTimeout(() => {
            navigate({ to: '/organizations' })
          }, REDIRECT_DELAY)
        },
      })
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [token, acceptInvite, navigate])

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle>Accepting Invitation</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center gap-4 py-10'>
          {isPending && (
            <>
              <Loader2 className='text-primary h-10 w-10 animate-spin' />
              <p className='text-muted-foreground text-center'>
                Please wait while we process your invitation...
              </p>
            </>
          )}
          {!isPending && !isError && (
            <div className='text-center text-green-600'>
              <p className='text-lg font-semibold'>Success!</p>
              <p>
                Invitation accepted. Redirecting you to your organizations...
              </p>
            </div>
          )}
          {isError && (
            <div className='text-destructive text-center'>
              <p className='text-lg font-semibold'>Error</p>
              <p>
                {error instanceof Error
                  ? error.message
                  : 'Failed to accept invitation'}
              </p>
              <p className='text-muted-foreground mt-4 text-sm'>
                The link might be expired or invalid.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
