import { Briefcase, Calendar, Users } from 'lucide-react'
import { formatDate } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import type { Organization } from '@/entities/organization'

interface OverviewTabContentProps {
  organization: Organization
  memberCount: number
}

export function OverviewTabContent({
  organization,
  memberCount,
}: OverviewTabContentProps) {
  const createdDate = formatDate(organization.createdAt)

  const stats = [
    {
      label: 'Team Members',
      value: memberCount,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active Projects',
      value: organization.stats?.projects ?? 0,
      icon: Briefcase,
      color: 'text-purple-500',
    },
    {
      label: 'Upcoming Events',
      value: organization.stats?.events ?? 0,
      icon: Calendar,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About {organization.name}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p className='text-muted-foreground'>
            {organization.description ||
              'No description provided for this organization.'}
          </p>
          {createdDate && (
            <div className='text-muted-foreground pt-2 text-sm'>
              Created on {createdDate}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
