import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

export default function NotFound() {
  return (
    <ErrorState
      statusCode='404'
      title='Oops! Page Not Found!'
      description={
        <>
          It seems like the page you&apos;re looking for <br />
          does not exist or might have been removed.
        </>
      }
    >
      <Button asChild>
        <Link href={ROUTES.home}>Back to Home</Link>
      </Button>
    </ErrorState>
  )
}
