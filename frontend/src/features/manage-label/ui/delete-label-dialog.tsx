'use client'

import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/lib'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/core/alert-dialog'
import type { LabelDto } from '@/entities/label'
import { deleteLabelAction } from '../api/delete-label.action'
import { useLabelSearchParams } from '../model/label-search-params'

interface DeleteLabelDialogProps {
  slug: string
  labels: LabelDto[]
}

export const DeleteLabelDialog = ({ slug, labels }: DeleteLabelDialogProps) => {
  const [{ 'delete-label': deleteId }, setParams] = useLabelSearchParams()
  const router = useRouter()

  const activeLabel = deleteId
    ? labels.find((l) => l.id === deleteId)
    : undefined
  const isOpen = !!activeLabel

  const closeDelete = () => setParams({ 'delete-label': null })

  const { execute, isPending } = useAction(deleteLabelAction, {
    successMessage: 'Label deleted successfully!',
    onSuccess: () => {
      closeDelete()
      router.refresh()
    },
  })

  const onConfirm = async () => {
    if (!activeLabel) return
    await execute({ slug, id: activeLabel.id })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDelete()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Label</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{activeLabel?.name}" label?
            This action cannot be undone and will remove the label from all
            tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
