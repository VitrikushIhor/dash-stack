import { Avatar } from '@radix-ui/react-avatar'
import { Mail } from 'lucide-react'
import { AvatarFallback, AvatarImage } from '@/shared/ui/components/ui/avatar'
import { Card, CardContent } from '@/shared/ui/components/ui/card'
import { type TeamMember } from '@/entities/team'

interface TeamMemberCardProps {
  member: TeamMember
  onEmailClick?: (email: string) => void
}

export const TeamMemberCard = ({
  member,
  onEmailClick,
}: TeamMemberCardProps) => {
  const initials = member.first_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleEmailClick = () => {
    if (onEmailClick) {
      onEmailClick(member.email)
    } else {
      window.location.href = `mailto:${member.email}`
    }
  }

  return (
    <Card className='group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
      <div className='from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      <CardContent className='relative flex flex-col items-center gap-4 p-6'>
        <Avatar className='border-accent-foreground h-32 w-32 rounded-full border-4 shadow-xl transition-transform duration-300 group-hover:scale-105'>
          <AvatarImage
            src={member.avatar}
            alt={member.first_name}
            className='rounded-full object-cover'
          />
          <AvatarFallback className='bg-primary/10 text-primary text-2xl font-semibold'>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className='flex flex-col items-center gap-1 text-center'>
          <h3 className='text-foreground text-xl font-semibold tracking-tight'>
            {member.first_name} {member.last_name}
          </h3>
          <p className='text-muted-foreground text-sm font-medium'>
            {member.position}
          </p>
        </div>

        <button
          onClick={handleEmailClick}
          className='group/email text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors'
          aria-label={`Send email to ${member.first_name} ${member.last_name}`}
        >
          <Mail className='h-4 w-4 transition-transform group-hover/email:scale-110' />
          <span className='max-w-[200px] truncate'>{member.email}</span>
        </button>
      </CardContent>
    </Card>
  )
}

