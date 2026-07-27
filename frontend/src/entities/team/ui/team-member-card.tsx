'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config/constants/routes'
import { getInitials } from '@/shared/lib/utils'
import {
  type Membership,
  formatPosition,
  getMemberDisplayName,
} from '@/shared/model'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Card, CardContent } from '@/shared/ui/core/card'

interface TeamMemberCardProps {
  membership: Membership
  orgId: string
}

export const TeamMemberCard = ({ membership, orgId }: TeamMemberCardProps) => {
  const { user, role, position } = membership
  const displayName = getMemberDisplayName(user)
  const displayRole = position ? formatPosition(position) : role
  const initials = getInitials(displayName)

  const targetOrgId = orgId || membership.orgId || ''

  return (
    <Link
      href={`${ROUTES.organizations}/${targetOrgId}/members/${user.id}`}
      className='block no-underline'
    >
      <Card className='group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
        <div className='from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

        <CardContent className='relative flex flex-col items-center gap-4 p-6'>
          <Avatar className='border-accent-foreground h-32 w-32 rounded-full border-4 shadow-xl transition-transform duration-300 group-hover:scale-105'>
            <AvatarImage
              src={user.avatar}
              alt={displayName}
              className='rounded-full object-cover'
            />
            <AvatarFallback className='bg-primary/10 text-primary text-2xl font-semibold'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col items-center text-center'>
            <h3 className='group-hover:text-primary text-lg font-bold tracking-tight transition-colors'>
              {displayName}
            </h3>
            <p className='text-muted-foreground text-sm font-medium'>
              {displayRole}
            </p>
          </div>

          <div className='bg-secondary/50 group-hover:bg-secondary flex w-full items-center justify-center gap-2 rounded-lg py-2 transition-colors'>
            <Mail className='text-muted-foreground h-4 w-4' />
            <span className='text-muted-foreground text-xs font-medium'>
              {user.email}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
