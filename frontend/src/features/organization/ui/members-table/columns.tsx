import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { getInitials } from '@/shared/lib/utils'
import {
  getMemberDisplayName,
  getRoleVariant,
} from '@/shared/model/utils/membership'
import { DataTableColumnHeader } from '@/shared/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Badge } from '@/shared/ui/core/badge'
import {
  type Membership,
  type OrgRole,
} from '../../model/types/organization.types'

export const columns: ColumnDef<Membership>[] = [
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Member' />
    ),
    cell: ({ row }) => {
      const { user, orgId } = row.original
      const userId = user?.id

      if (!userId) return null

      return (
        <Link
          to='/organizations/$orgId/members/$userId'
          params={{ orgId: orgId || '', userId }}
          className='flex items-center gap-3 hover:underline'
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {getInitials(getMemberDisplayName(user))}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{getMemberDisplayName(user)}</span>
            <span className='text-muted-foreground text-xs'>{user.email}</span>
          </div>
        </Link>
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
      return <Badge variant={getRoleVariant(role)}>{role}</Badge>
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
