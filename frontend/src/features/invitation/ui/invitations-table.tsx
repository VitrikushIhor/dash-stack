import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/components/data-table'
import { useListInvitations } from '../api/hooks/use-list-invitations'
import { useRevokeInvite } from '../api/hooks/use-revoke-invite'
import { getColumns } from './invitations-table/columns'

interface InvitationsTableProps {
  orgId: string
}

export const InvitationsTable = ({ orgId }: InvitationsTableProps) => {
  const { data: invitations, isLoading } = useListInvitations(orgId)
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInvite()

  const columns = getColumns({
    onRevoke: (id) => revokeInvite({ orgId, id }),
    isRevoking,
  })

  const table = useReactTable({
    data: invitations ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
      </div>
    )
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className='flex h-32 items-center justify-center rounded-lg border border-dashed'>
        <p className='text-muted-foreground text-sm'>No pending invitations</p>
      </div>
    )
  }

  return <DataTable table={table} />
}
