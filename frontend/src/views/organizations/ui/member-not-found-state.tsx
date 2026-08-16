import Link from 'next/link'
import { UserX, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { Button } from '@/shared/ui/core/button'

interface MemberNotFoundStateProps {
  orgId: string
}

export function MemberNotFoundState({ orgId }: MemberNotFoundStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='bg-muted/60 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl'>
        <UserX className='text-muted-foreground h-7 w-7' />
      </div>
      <h1 className='text-2xl font-bold tracking-tight'>Member not found</h1>
      <p className='text-muted-foreground mt-1 mb-6 max-w-sm text-sm'>
        The member you are looking for does not exist in this organization or
        has been removed.
      </p>
      <Button asChild className='gap-2 shadow-xs'>
        <Link href={`${ROUTES.organizations}/${orgId}`}>
          <ArrowLeft className='h-4 w-4' />
          Back to Organization
        </Link>
      </Button>
    </div>
  )
}
