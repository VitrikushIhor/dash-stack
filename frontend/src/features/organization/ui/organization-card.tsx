import { Link } from '@tanstack/react-router'
import { Users, Briefcase } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import { useOrgStore } from '../model/store/organization-store'
import { type Organization } from '../model/types/organization.types'

interface OrganizationCardProps {
  organization: Organization
}

export const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  const { setActiveOrgId } = useOrgStore()

  return (
    <Link
      to='/organizations/$orgId'
      params={{ orgId: organization.id }}
      onClick={() => setActiveOrgId(organization.id)}
      className='block transition-transform hover:scale-[1.02]'
    >
      <Card className='hover:border-primary/50 h-full cursor-pointer'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className='h-10 w-10 rounded-lg object-cover'
              />
            ) : (
              <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold'>
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className='text-lg'>{organization.name}</CardTitle>
              <CardDescription className='line-clamp-1'>
                {organization.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          <div className='text-muted-foreground mt-4 flex gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <Users className='h-4 w-4' />
              <span>{organization.stats?.members || 0} members</span>
            </div>
            <div className='flex items-center gap-1'>
              <Briefcase className='h-4 w-4' />
              <span>{organization.stats?.projects || 0} projects</span>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
