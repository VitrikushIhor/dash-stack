'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/core/dialog'
import type { LabelDto } from '@/entities/label'
import { useLabelSearchParams } from '../model/label-search-params'
import { LabelForm } from './label-form'

interface LabelFormDialogProps {
  labels: LabelDto[]
}

export const LabelFormDialog = ({ labels }: LabelFormDialogProps) => {
  const [{ 'create-label': create, 'update-label': updateId }, setParams] =
    useLabelSearchParams()

  const activeLabel = updateId
    ? labels.find((l) => l.id === updateId)
    : undefined
  const isOpen = create || !!activeLabel
  const isUpdate = !!activeLabel

  const closeForm = () => {
    setParams({ 'create-label': null, 'update-label': null })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Edit Label' : 'Create Label'}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update the details for this label.'
              : 'Add a new label to organize tasks in your organization.'}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <LabelForm
            initialData={activeLabel}
            onSuccess={closeForm}
            submitLabel={isUpdate ? 'Save' : 'Create'}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
