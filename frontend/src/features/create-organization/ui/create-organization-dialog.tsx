'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/core/dialog'
import { useCreateOrganizationModalStore } from '../model/use-create-organization-modal-store'
import { CreateOrganizationForm } from './create-organization-form'

export const CreateOrganizationDialog = () => {
  const { isOpen, close } = useCreateOrganizationModalStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage your projects and team.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <CreateOrganizationForm onSuccess={close} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
