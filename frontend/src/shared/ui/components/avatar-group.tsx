import { memo } from 'react'
import { cn, stringToColor } from '@/shared/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip'

interface AvatarGroupProps {
  members: Array<{
    id: string
    avatar?: string | null
    first_name?: string
    last_name?: string
    user?: {
      firstName?: string
      avatar?: string | null
    }
  }>
  max?: number
  size?: 'm' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  m: 'h-6 w-6  text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export const AvatarGroup = memo(function AvatarGroup({
  members,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const visibleMembers = members.slice(0, max)
  const remainingCount = Math.max(0, members.length - max)

  const getName = (member: (typeof members)[0]) => {
    if (member.user?.firstName) return member.user.firstName
    if (member.first_name)
      return `${member.first_name} ${member.last_name || ''}`
    return 'User'
  }

  const getAvatar = (member: (typeof members)[0]) => {
    return member.user?.avatar || member.avatar
  }

  return (
    <TooltipProvider>
      <div className={cn('flex -space-x-2', className)}>
        {visibleMembers.map((member) => {
          const name = getName(member)
          const avatar = getAvatar(member)
          return (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    'border-background ring-background border-2 ring-2 transition-transform hover:z-10 hover:scale-110'
                  )}
                  style={{
                    backgroundColor: avatar ? undefined : stringToColor(name),
                  }}
                >
                  <AvatarImage src={avatar || undefined} alt={`${name}`} />
                  <AvatarFallback className='text-white'>
                    {name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  'border-background bg-muted border-2'
                )}
              >
                <AvatarFallback className='text-muted-foreground'>
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
})
