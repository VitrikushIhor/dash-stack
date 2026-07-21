'use client'

import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { getInitials } from '@/shared/lib/utils'
import { getMemberDisplayName, getRoleVariant } from '@/shared/model'
import { DataTableColumnHeader } from '@/shared/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Badge } from '@/shared/ui/core/badge'
import { type Membership, type OrgRole } from '@/entities/organization'

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
          href={`/organizations/${orgId || ''}/members/${userId}`}
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
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <span className='text-muted-foreground text-sm'>
          {format(new Date(date), 'MMM d, yyyy')}
        </span>
      )
    },
  },
]
