import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { DataTableColumnHeader } from '@/shared/ui/data-table'
import { type Invitation } from '@/entities/organization'

export const invitationsTableColumns: ColumnDef<Invitation>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('email')}</span>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.getValue('role')}</Badge>
    ),
  },
  {
    accessorKey: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expires' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-xs'>
        {format(new Date(row.getValue('expiresAt')), 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        revokeInvite?: (id: string) => void
        revokingId?: string | null
      }

      const { revokeInvite, revokingId } = meta || {}
      const isRevoking = revokingId === row.original.id

      return (
        <div className='text-right'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => revokeInvite?.(row.original.id)}
            disabled={isRevoking}
            className='text-destructive hover:text-destructive hover:bg-destructive/10'
            aria-label='Revoke invitation'
          >
            {isRevoking ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      )
    },
  },
]
