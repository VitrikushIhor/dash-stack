import { createFileRoute, useParams } from '@tanstack/react-router'
import { Users, Briefcase, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { useGetOrganization } from '@/features/organization'

export const Route = createFileRoute('/_authenticated/organizations/$orgId/')({
  component: OrganizationOverviewPage,
})

function OrganizationOverviewPage() {
  const { orgId } = useParams({ from: '/_authenticated/organizations/$orgId/' })
  const { data: organization } = useGetOrganization(orgId)

  if (!organization) return null

  const stats = [
    {
      label: 'Team Members',
      value: organization.stats?.members || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active Projects',
      value: organization.stats?.projects || 0,
      icon: Briefcase,
      color: 'text-purple-500',
    },
    {
      label: 'Upcoming Events',
      value: organization.stats?.events || 0,
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
        <CardContent>
          <p className='text-muted-foreground'>
            {organization.description ||
              'No description provided for this organization.'}
          </p>
          <div className='text-muted-foreground mt-4 text-sm'>
            Created on {new Date(organization.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
