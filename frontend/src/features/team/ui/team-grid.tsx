import { type TeamMember, TeamMemberCard } from '@/entities/team'

interface TeamGridProps {
  members: TeamMember[]
  onEmailClick?: (email: string) => void
}

export const TeamGrid = ({ members, onEmailClick }: TeamGridProps) => {
  if (!members || members.length === 0) {
    return (
      <div
        className='text-muted-foreground flex w-full flex-col items-center justify-center py-8'
        role='status'
        aria-live='polite'
      >
        <span className='text-lg font-medium'>No team members found.</span>
      </div>
    )
  }

  return (
    <div
      className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      tabIndex={0}
      aria-label='Team members grid'
    >
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onEmailClick={onEmailClick}
        />
      ))}
    </div>
  )
}
