import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { Button } from '@/shared/ui/core/button'
import { OrganizationLogo, type Organization } from '@/entities/organization'

interface OrganizationDetailHeaderProps {
  organization: Organization
}

export function OrganizationDetailHeader({
  organization,
}: OrganizationDetailHeaderProps) {
  return (
    <div className='flex items-center gap-4'>
      <Button asChild variant='ghost' size='icon' className='rounded-lg'>
        <Link href={ROUTES.organizations} aria-label='Back to organizations'>
          <ArrowLeft className='h-4 w-4' />
        </Link>
      </Button>

      <OrganizationLogo
        name={organization.name}
        logo={organization.logo}
        size={48}
        className='bg-primary/10 text-primary border-border/40 h-12 w-12 rounded-xl border text-xl font-bold shadow-xs'
      />

      <div>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
          {organization.name}
        </h1>
        {organization.slug && (
          <p className='text-muted-foreground text-xs sm:text-sm'>
            @{organization.slug}
          </p>
        )}
      </div>
    </div>
  )
}
