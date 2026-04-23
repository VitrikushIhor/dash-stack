import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/shared/ui/components/data-table'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import { Badge } from '@/shared/ui/components/ui/badge'
import { type Membership, OrgRole } from '../../model/types/organization.types'

export const columns: ColumnDef<Membership>[] = [
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Member' />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{user.firstName || 'User'}</span>
            <span className='text-muted-foreground text-xs'>{user.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as OrgRole
      return (
        <Badge variant={role === OrgRole.OWNER ? 'default' : 'secondary'}>
          {role}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined' />
    ),
    cell: ({ row }) => {
      return (
        <span className='text-muted-foreground text-sm'>
          {format(new Date(row.getValue('joinedAt')), 'MMM d, yyyy')}
        </span>
      )
    },
  },
]
