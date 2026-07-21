'use client'

import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getInitials } from '@/shared/lib/utils'
import {
  formatPosition,
  formatJoinedDate,
  getRoleVariant,
  getMemberDisplayName,
} from '@/shared/model'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { type Membership } from '@/entities/organization'

interface MemberDetailViewProps {
  membership: Membership
  orgId: string
}

export const MemberDetailView = ({
  membership,
  orgId,
}: MemberDetailViewProps) => {
  const { user, role, position, joinedAt } = membership
  const displayName = getMemberDisplayName(user)
  const initials = getInitials(displayName)
  const formattedDate = formatJoinedDate(joinedAt)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href={`/organizations/${orgId}/members`}>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h2 className='text-2xl font-bold tracking-tight'>Member Details</h2>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-start gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={user.avatar} />
              <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <CardTitle className='text-xl'>{displayName}</CardTitle>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Mail className='h-4 w-4' />
                {user.email}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 border-t pt-4'>
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
