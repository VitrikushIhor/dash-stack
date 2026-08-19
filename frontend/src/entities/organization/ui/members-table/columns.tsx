'use client'

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { ROUTES } from '@/shared/config'
import { getInitials } from '@/shared/lib/utils'
import {
  formatJoinedDate,
  getMemberDisplayName,
  getRoleVariant,
} from '@/shared/model'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Badge } from '@/shared/ui/core/badge'
import { DataTableColumnHeader } from '@/shared/ui/data-table'
import { useOrgSlug } from '../../model/hooks/use-org-slug'
import {
  type Membership,
  type OrgRole,
} from '../../model/types/organization.types'

function MemberCell({ membership }: { membership: Membership }) {
  const routeSlug = useOrgSlug()
  const slug = membership.organization?.slug ?? routeSlug ?? ''
  const { user } = membership
  const userId = user?.id

  if (!userId) return null

  return (
    <Link
      href={ROUTES.orgMemberDetail(slug, userId)}
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
}

export const membersTableColumns: ColumnDef<Membership>[] = [
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Member' />
    ),
    cell: ({ row }) => <MemberCell membership={row.original} />,
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
    accessorFn: (row) => row.joinedAt || row.createdAt,
    id: 'joinedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined Date' />
    ),
    cell: ({ row }) => {
      const date = row.original.joinedAt || row.original.createdAt
      return (
        <span className='text-muted-foreground text-sm'>
          {formatJoinedDate(date)}
        </span>
      )
    },
  },
]
