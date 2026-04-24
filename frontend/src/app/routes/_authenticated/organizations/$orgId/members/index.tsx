import { useState } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { DataTable } from '@/shared/ui/components/data-table'
import { Button } from '@/shared/ui/components/ui/button'
import { InviteMemberDialog, InvitationsTable } from '@/features/invitation'
import { useGetOrganization, useGetMembers } from '@/features/organization'
import { useOrganizationPermission } from '@/features/organization/lib/hooks/use-organization-permission'
import { columns } from '@/features/organization/ui/members-table/columns'
import { TeamGrid } from '@/features/team'

export const Route = createFileRoute(
  '/_authenticated/organizations/$orgId/members/'
)({
  component: OrganizationMembersPage,
})

function OrganizationMembersPage() {
  const { orgId } = useParams({
    from: '/_authenticated/organizations/$orgId/members/',
  })
  const { data: organization, isLoading: isOrgLoading } = useGetOrganization(
    orgId,
    { staleTime: Infinity }
  )
  const { data: memberships, isLoading: isMembersLoading } =
    useGetMembers(orgId)

  const { canManage, isLoading: isPermissionLoading } =
    useOrganizationPermission(organization)

  const [view, setView] = useState<'grid' | 'table'>('grid')

  const table = useReactTable({
    data: memberships ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isOrgLoading || isPermissionLoading || isMembersLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    )
  }

  if (!organization) return null

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Team Members</h2>
          <p className='text-muted-foreground'>
            Manage your team members and their roles.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='bg-muted flex items-center rounded-lg p-1'>
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => setView('grid')}
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
            <Button
              variant={view === 'table' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => setView('table')}
            >
              <LayoutList className='h-4 w-4' />
            </Button>
          </div>
          {canManage && <InviteMemberDialog orgId={orgId} />}
        </div>
      </div>

      {view === 'grid' ? (
        <TeamGrid memberships={memberships ?? []} orgId={orgId} />
      ) : (
        <DataTable table={table} />
      )}

      {canManage && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Pending Invitations</h3>
          <InvitationsTable orgId={orgId} />
        </div>
      )}
    </div>
  )
}
