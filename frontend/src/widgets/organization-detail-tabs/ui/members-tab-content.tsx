'use client'

import { useMemo } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { DataTable } from '@/shared/ui/data-table'
import { WidgetErrorState } from '@/shared/ui/feedback'
import type { Membership, Organization } from '@/entities/organization'
import {
  InviteMemberDialog,
  useInviteMemberModalStore,
} from '@/features/invitation'
import { membersTableColumns } from '@/features/organization'
import { useOrganizationPermission } from '@/features/organization/model/hooks/use-organization-permission'

interface MembersTabContentProps {
  organization: Organization
  initialMembers: Membership[]
  initialError?: string | null
}

export function MembersTabContent({
  organization,
  initialMembers,
  initialError,
}: MembersTabContentProps) {
  const { canManage } = useOrganizationPermission(organization)
  const { open: openInvite } = useInviteMemberModalStore()

  const data = useMemo(() => initialMembers, [initialMembers])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: membersTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (initialError) {
    return (
      <WidgetErrorState
        title='Failed to load team members'
        description={initialError}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-semibold tracking-tight'>Team Members</h3>

          <p className='text-muted-foreground text-sm'>
            Manage people and their access permissions in this organization.
          </p>
        </div>

        {canManage && (
          <Button className='gap-2' onClick={() => openInvite(organization.id)}>
            <Plus className='h-4 w-4' />
            Invite Member
          </Button>
        )}
      </div>

      <DataTable table={table} />

      <InviteMemberDialog />
    </div>
  )
}
