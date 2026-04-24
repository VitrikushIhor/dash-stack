import { Link } from '@tanstack/react-router'
import { Mail, ArrowLeft } from 'lucide-react'
import { getInitials } from '@/shared/lib/utils'
import {
  formatPosition,
  formatJoinedDate,
  getRoleVariant,
  getMemberDisplayName,
} from '@/shared/model/utils/membership'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import { Badge } from '@/shared/ui/components/ui/badge'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import { Separator } from '@/shared/ui/components/ui/separator'
import { type Membership } from '../model/types/organization.types'

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
        <Link to='/organizations/$orgId/members' params={{ orgId }}>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h2 className='text-2xl font-bold tracking-tight'>Member Details</h2>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Profile Card */}
        <Card className='lg:col-span-1'>
          <CardContent className='flex flex-col items-center gap-6 pt-10 pb-10'>
            <Avatar className='border-muted h-32 w-32 border-4 shadow-xl'>
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className='bg-primary/10 text-primary text-3xl font-semibold'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col items-center gap-2 text-center'>
              <h3 className='text-2xl font-bold'>{displayName}</h3>
              <a
                href={`mailto:${user.email}`}
                className='text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors'
              >
                <Mail className='h-4 w-4' />
                <span className='text-sm'>{user.email}</span>
              </a>
            </div>

            <Button asChild className='w-full max-w-[200px]'>
              <a href={`mailto:${user.email}`}>Send Email</a>
            </Button>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Role
                </p>
                <Badge variant={getRoleVariant(role)}>{role}</Badge>
              </div>

              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Position
                </p>
                <p className='text-base font-medium'>
                  {position ? formatPosition(position) : '—'}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Member since
                </p>
                <p className='text-base font-medium'>{formattedDate}</p>
              </div>

              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  User ID
                </p>
                <p className='text-muted-foreground font-mono text-xs'>
                  {user.id}
                </p>
              </div>
            </div>

            <Separator />

            <div className='bg-muted/50 rounded-lg p-4'>
              <p className='text-muted-foreground text-xs'>
                Account created on{' '}
                {new Date(membership.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
