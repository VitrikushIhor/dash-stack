'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Users } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import {
  OrganizationLogo,
  type OrganizationSummary,
} from '@/entities/organization'

export interface OrganizationCardProps {
  organization: OrganizationSummary
  role?: string
  memberCount?: number
  onSelect?: (organization: OrganizationSummary) => void
}

export function OrganizationCard({
  organization,
  role,
  memberCount,
  onSelect,
}: OrganizationCardProps) {
  const members = memberCount ?? organization.stats?.members ?? 0
  const displayRole = role || 'Member'

  const handleClick = () => {
    onSelect?.(organization)
  }

  return (
    <Link
      href={ROUTES.orgOverview(organization.slug)}
      onClick={handleClick}
      className='group focus-visible:ring-ring block rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
    >
      <Card className='hover:border-primary/50 h-full cursor-pointer transition-colors duration-200 hover:shadow-md'>
        <CardHeader className='p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3.5'>
              <OrganizationLogo
                name={organization.name}
                logo={organization.logo}
                size={44}
                className='bg-primary/10 text-primary border-border/40 h-11 w-11 shrink-0 rounded-lg border shadow-xs'
              />
              <div className='min-w-0 flex-1'>
                <CardTitle className='group-hover:text-primary truncate text-base font-semibold tracking-tight transition-colors'>
                  {organization.name}
                </CardTitle>
                {organization.description && (
                  <p className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
                    {organization.description}
                  </p>
                )}
                <CardDescription className='mt-2.5 flex flex-wrap items-center gap-3 text-xs'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <Users className='h-3.5 w-3.5' />
                    <span>
                      {members} {members === 1 ? 'member' : 'members'}
                    </span>
                  </span>
                  <span className='text-foreground/80 flex items-center gap-1.5 font-medium capitalize'>
                    <Shield className='text-primary/70 h-3.5 w-3.5' />
                    <span>{displayRole.toLowerCase()}</span>
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className='text-muted-foreground/40 group-hover:text-primary p-1 transition-all group-hover:translate-x-0.5'>
              <ArrowRight className='h-4 w-4' />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
