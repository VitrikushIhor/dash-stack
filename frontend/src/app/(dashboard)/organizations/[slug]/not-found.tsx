import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { Main } from '@/widgets/layout'

export default function OrganizationNotFound() {
  return (
    <Main>
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <div className='bg-muted/60 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl'>
          <Building2 className='text-muted-foreground h-7 w-7' />
        </div>

        <h1 className='text-2xl font-bold tracking-tight'>
          Organization not found
        </h1>

        <p className='text-muted-foreground mt-1 mb-6 max-w-sm text-sm'>
          The organization you are looking for does not exist or you do not have
          permission to view it.
        </p>

        <Button asChild className='gap-2 shadow-xs'>
          <Link href={ROUTES.organizations}>
            <ArrowLeft className='h-4 w-4' />
            Back to Organizations
          </Link>
        </Button>
      </div>
    </Main>
  )
}
