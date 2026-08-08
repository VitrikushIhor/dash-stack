import { type UserMembership } from '@/entities/organization'
import { OrganizationCard } from '@/features/organization'

export interface OrganizationGridProps {
  memberships: readonly UserMembership[]
}

export function OrganizationGrid({ memberships }: OrganizationGridProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {memberships.map((membership) => (
        <OrganizationCard
          key={membership.organization.id}
          organization={membership.organization}
          role={membership.role}
        />
      ))}
    </div>
  )
}
