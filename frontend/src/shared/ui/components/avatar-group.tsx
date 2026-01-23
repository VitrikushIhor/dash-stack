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
import { type TeamMember } from '@/entities/team'

interface AvatarGroupProps {
  members: TeamMember[]
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`
  }
  return (
    <TooltipProvider>
      <div className={cn('flex -space-x-2', className)}>
        {visibleMembers.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  'border-background ring-background border-2 ring-2 transition-transform hover:z-10 hover:scale-110'
                )}
                style={{
                  backgroundColor: member.avatar
                    ? undefined
                    : stringToColor(
                        getInitials(member.first_name, member.last_name)
                      ),
                }}
              >
                <AvatarImage
                  src={member.avatar}
                  alt={`${member.first_name} $me`}
                />
                <AvatarFallback className='text-white'>
                  {getInitials(member.first_name, member.last_name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getInitials(member.first_name, member.last_name)}</p>
            </TooltipContent>
          </Tooltip>
        ))}

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
