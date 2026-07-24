'use client'

import { useMemo } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Users,
  Briefcase,
  Calendar,
  Loader2,
  LayoutDashboard,
  Settings,
  Building2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { ConfigDrawer } from '@/shared/ui/config-drawer'
import { Button } from '@/shared/ui/core/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/core/tabs'
import { DataTable } from '@/shared/ui/data-table'
import { Search } from '@/shared/ui/search'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { useGetOrganization, useGetMembers } from '@/entities/organization'
import {
  OrganizationSettingsForm,
  DeleteOrganizationButton,
  membersTableColumns,
} from '@/features/organization'
import { Header, Main, NavUser } from '@/widgets/layout'

interface OrganizationDetailPageProps {
  orgId: string
}

export function OrganizationDetailPage({ orgId }: OrganizationDetailPageProps) {
  const {
    data: organization,
    isLoading: isOrgLoading,
    isError,
  } = useGetOrganization(orgId)
  const { data: members, isLoading: isMembersLoading } = useGetMembers(orgId)

  const membersData = useMemo(() => members ?? [], [members])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: membersData,
    columns: membersTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isOrgLoading) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <NavUser />
          </div>
        </Header>
        <Main>
          <div className='flex h-[50vh] items-center justify-center'>
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
          </div>
        </Main>
      </>
    )
  }

  if (isError || !organization) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <NavUser />
          </div>
        </Header>
        <Main>
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <Building2 className='text-muted-foreground mb-4 h-12 w-12' />
            <h1 className='text-2xl font-bold'>Organization not found</h1>
            <p className='text-muted-foreground mt-1 mb-4 text-sm'>
              The organization you are looking for does not exist or you do not
              have permission to view it.
            </p>
            <Button asChild>
              <Link href='/organizations'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Organizations
              </Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const memberCount = members?.length ?? organization.stats?.members ?? 0

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
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center gap-4'>
          <Button asChild variant='ghost' size='icon'>
            <Link href='/organizations'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>

          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className='h-12 w-12 rounded-xl object-cover'
            />
          ) : (
            <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold'>
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className='text-3xl font-bold'>{organization.name}</h1>
            {organization.slug && (
              <p className='text-muted-foreground text-sm'>
                @{organization.slug}
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='overview' className='gap-2'>
              <LayoutDashboard className='h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='members' className='gap-2'>
              <Users className='h-4 w-4' />
              Members ({memberCount})
            </TabsTrigger>
            <TabsTrigger value='settings' className='gap-2'>
              <Settings className='h-4 w-4' />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
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
                {organization.createdAt &&
                  !isNaN(new Date(organization.createdAt).getTime()) && (
                    <div className='text-muted-foreground pt-2 text-sm'>
                      Created on{' '}
                      {new Date(organization.createdAt).toLocaleDateString()}
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='members' className='space-y-4'>
            {isMembersLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-12 w-full rounded-md' />
                ))}
              </div>
            ) : (
              <DataTable table={table} />
            )}
          </TabsContent>

          <TabsContent value='settings' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <OrganizationSettingsForm organization={organization} />
              </CardContent>
            </Card>

            <Card className='border-destructive/30'>
              <CardHeader>
                <CardTitle className='text-destructive'>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Delete Organization</p>
                  <p className='text-muted-foreground text-sm'>
                    Permanently remove this organization and all its data.
                  </p>
                </div>
                <DeleteOrganizationButton orgId={organization.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
