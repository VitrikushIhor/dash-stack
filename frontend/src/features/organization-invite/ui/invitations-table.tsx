'use client'

import { useEffect, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTable } from '@/shared/ui/data-table'
import type { Invitation } from '@/entities/organization'
import { useRevokeInvite } from '../model/use-revoke-invite'
import { invitationsTableColumns } from './invitations-table-columns'

interface InvitationsTableProps {
  orgId: string
  invitations: Invitation[]
}

export const InvitationsTable = ({
  orgId,
  invitations,
}: InvitationsTableProps) => {
  const { revokeInvite, isPending: isRevokingAction } = useRevokeInvite()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isRevokingAction) {
      setRevokingId(null)
    }
  }, [isRevokingAction])

  const table = useReactTable({
    data: invitations,
    columns: invitationsTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      revokeInvite: (id: string) => {
        setRevokingId(id)
        revokeInvite(orgId, id)
      },
      revokingId,
    },
  })

  return <DataTable table={table} />
}
