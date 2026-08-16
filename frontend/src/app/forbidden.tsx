import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

export default function Forbidden() {
  return (
    <ErrorState
      statusCode='403'
      title='Access Forbidden'
      description={
        <>
          You don&apos;t have the necessary permission <br />
          to view this resource.
        </>
      }
    >
      <Button variant='outline' asChild>
        <Link href={ROUTES.home}>Back to Home</Link>
      </Button>
    </ErrorState>
  )
}
