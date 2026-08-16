import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

export default function Unauthorized() {
  return (
    <ErrorState
      statusCode='401'
      title='Unauthorized Access'
      description={
        <>
          Please log in with the appropriate credentials <br /> to access this
          resource.
        </>
      }
    >
      <Button asChild>
        <Link href={ROUTES.signIn}>Sign In</Link>
      </Button>
    </ErrorState>
  )
}
