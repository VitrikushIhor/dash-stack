import { Building2 } from 'lucide-react'
import { CreateOrganizationButton } from '@/features/create-organization'

export function OrganizationEmptyState() {
  return (
    <div className='border-border/80 bg-muted/20 flex min-h-95 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center sm:p-12'>
      <div className='bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs'>
        <Building2 className='h-7 w-7' />
      </div>
      <h3 className='text-foreground text-lg font-semibold tracking-tight'>
        No organizations found
      </h3>
      <p className='text-muted-foreground mt-1.5 max-w-sm text-sm'>
        You don&apos;t belong to any organizations yet. Get started by creating
        your first organization workspace.
      </p>
      <div className='mt-6'>
        <CreateOrganizationButton size='default' className='gap-2 shadow-sm' />
      </div>
    </div>
  )
}
