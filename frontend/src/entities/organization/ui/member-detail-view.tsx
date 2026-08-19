import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { getInitials } from '@/shared/lib/utils'
import {
  formatJoinedDate,
  formatPosition,
  getMemberDisplayName,
  getRoleVariant,
} from '@/shared/model'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { type Membership } from '../model/types/organization.types'

interface MemberDetailViewProps {
  membership: Membership
  slug: string
}

export const MemberDetailView = ({
  membership,
  slug,
}: MemberDetailViewProps) => {
  const { user, role, position, joinedAt } = membership
  const displayName = getMemberDisplayName(user)
  const initials = getInitials(displayName)
  const formattedDate = formatJoinedDate(joinedAt)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button asChild variant='ghost' size='icon' className='rounded-lg'>
          <Link href={ROUTES.orgMembers(slug)} aria-label='Back to members'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <h2 className='text-2xl font-bold tracking-tight'>Member Details</h2>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-start gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className='text-lg font-semibold'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <CardTitle className='text-xl'>{displayName}</CardTitle>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Mail className='h-4 w-4 shrink-0' />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2'>
            <div>
              <p className='text-muted-foreground text-sm font-medium'>Role</p>
              <Badge variant={getRoleVariant(role)} className='mt-1'>
                {role}
              </Badge>
            </div>
            <div>
              <p className='text-muted-foreground text-sm font-medium'>
                Position
              </p>
              <p className='mt-1 text-sm font-medium'>
                {formatPosition(position)}
              </p>
            </div>
            {formattedDate && (
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Joined Date
                </p>
                <p className='mt-1 text-sm font-medium'>{formattedDate}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
