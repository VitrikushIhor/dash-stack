import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTable } from '@/shared/ui/components/data-table'
import { InviteMemberDialog, InvitationsTable } from '@/features/invitation'
import { useGetOrganization } from '@/features/organization'
import { useOrganizationPermission } from '@/features/organization/lib/hooks/use-organization-permission'
import { columns } from '@/features/organization/ui/members-table/columns'

export const Route = createFileRoute(
  '/_authenticated/organizations/$orgId/members'
)({
  component: OrganizationMembersPage,
})

function OrganizationMembersPage() {
  const { orgId } = useParams({
    from: '/_authenticated/organizations/$orgId/members',
  })
  const { data: organization, isLoading: isOrgLoading } =
    useGetOrganization(orgId)
  const { canManage, isLoading: isPermissionLoading } =
    useOrganizationPermission(organization)

  const table = useReactTable({
    data: organization?.memberships ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isOrgLoading || isPermissionLoading) {
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
        {canManage && <InviteMemberDialog orgId={orgId} />}
      </div>

      <DataTable table={table} />

      {canManage && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Pending Invitations</h3>
          <InvitationsTable orgId={orgId} />
        </div>
      )}
    </div>
  )
}
