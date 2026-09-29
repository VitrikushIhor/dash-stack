import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { isSafeRedirectPath } from '@/shared/lib/safe-redirect-path'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

type SessionUnavailablePageProps = {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function SessionUnavailablePage({
  searchParams,
}: SessionUnavailablePageProps) {
  const { returnTo } = await searchParams
  const retryPath = isSafeRedirectPath(returnTo)
    ? returnTo!
    : ROUTES.organizations

  return (
    <ErrorState
      statusCode='503'
      title='Session temporarily unavailable'
      description='We could not check your session. Please try again. Your sign-in has been preserved.'
    >
      <Button asChild>
        <Link href={retryPath}>Try Again</Link>
      </Button>
    </ErrorState>
  )
}
