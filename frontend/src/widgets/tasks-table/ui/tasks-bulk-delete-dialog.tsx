import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/core/alert'
import { Input } from '@/shared/ui/core/input'
import { Label } from '@/shared/ui/core/label'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'

type TaskMultiDeleteDialogProps<TData> = {
  table: Table<TData>
  handleDelete: () => void
}

const CONFIRM_WORD = 'DELETE'

export function TasksBulkDeleteDialog<TData>({
  table,
  handleDelete,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <UrlConfirmDialog.Root
      queryKey='delete-selected-tasks'
      enabled={selectedRows.length > 0}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      confirmText='Delete'
      destructive
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'tasks' : 'task'}
        </UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          Are you sure you want to delete the selected tasks? This action cannot
          be undone.
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
      <UrlConfirmDialog.Body className='space-y-4'>
        <Label className='my-4 flex flex-col items-start gap-1.5'>
          <span>Confirm by typing "{CONFIRM_WORD}":</span>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
          />
        </Label>

        <Alert variant='destructive'>
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            Please be careful, this operation can not be rolled back.
          </AlertDescription>
        </Alert>
      </UrlConfirmDialog.Body>
    </UrlConfirmDialog.Root>
  )
}
