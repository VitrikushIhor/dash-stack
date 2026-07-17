import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/shared/ui'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { type Invitation } from '../../model/types/invitation.types'

interface ColumnsProps {
  onRevoke: (id: string) => void
  isRevoking: boolean
}

export const getColumns = ({
  onRevoke,
  isRevoking,
}: ColumnsProps): ColumnDef<Invitation>[] => [
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
    cell: ({ row }) => (
      <div className='text-right'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onRevoke(row.original.id)}
          disabled={isRevoking}
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
  },
]
