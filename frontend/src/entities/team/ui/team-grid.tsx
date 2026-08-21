import { type Membership } from '@/shared/model'
import { TeamMemberCard } from '@/entities/team'

interface TeamGridProps {
  memberships: Membership[]
  slug: string
}

export const TeamGrid = ({ memberships, slug }: TeamGridProps) => {
  if (!memberships || memberships.length === 0) {
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
      aria-label='Team members grid'
    >
      {memberships.map((membership) => (
        <TeamMemberCard
          key={membership.id}
          membership={membership}
          slug={slug}
        />
      ))}
    </div>
  )
}
