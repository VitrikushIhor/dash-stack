import { Link } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { getInitials } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import {
  formatPosition,
  getMemberDisplayName,
} from '@/shared/model/utils/membership'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import { Card, CardContent } from '@/shared/ui/components/ui/card'

interface TeamMemberCardProps {
  membership: Membership
  orgId: string
}

export const TeamMemberCard = ({ membership, orgId }: TeamMemberCardProps) => {
  const { user, role, position } = membership
  const displayName = getMemberDisplayName(user)
  const displayRole = position ? formatPosition(position) : role
  const initials = getInitials(displayName)

  return (
    <Link
      to='/organizations/$orgId/members/$userId'
      params={{ orgId: orgId || membership.orgId || '', userId: user.id }}
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

          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-foreground text-xl font-semibold tracking-tight'>
              {displayName}
            </h3>
            <p className='text-muted-foreground text-sm font-medium'>
              {displayRole}
            </p>
          </div>

          <div className='text-muted-foreground hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors'>
            <Mail className='h-4 w-4' />
            <span className='max-w-[200px] truncate'>{user.email}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
