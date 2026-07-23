'use client'

import { Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import {
  useActiveOrganization,
  type OrganizationSummary,
} from '@/entities/organization'

interface OrganizationCardProps {
  organization: OrganizationSummary
  role?: string
  memberCount?: number
}

export const OrganizationCard = ({
  organization,
  role,
  memberCount,
}: OrganizationCardProps) => {
  const { setActiveOrgId } = useActiveOrganization()
  const members = memberCount ?? organization.stats?.members ?? 0
  const displayRole = role || 'Member'

  return (
    <Link
      href={`/organizations/${organization.id}`}
      onClick={() => setActiveOrgId(organization.id)}
      className='block transition-transform hover:scale-[1.02]'
    >
      <Card className='hover:border-primary/50 h-full cursor-pointer'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className='h-10 w-10 rounded-lg object-cover'
              />
            ) : (
              <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold'>
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className='text-lg'>{organization.name}</CardTitle>
              <CardDescription className='mt-1 flex items-center gap-4'>
                <span className='flex items-center gap-1 text-xs'>
                  <Users className='h-3.5 w-3.5' />
                  {members} {members === 1 ? 'member' : 'members'}
                </span>
                <span className='flex items-center gap-1 text-xs capitalize'>
                  <Briefcase className='h-3.5 w-3.5' />
                  {displayRole.toLowerCase()}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
