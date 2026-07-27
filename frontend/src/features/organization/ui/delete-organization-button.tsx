'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants/routes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/core/alert-dialog'
import { Button } from '@/shared/ui/core/button'
import { useDeleteOrganization } from '@/entities/organization'

interface DeleteOrganizationButtonProps {
  orgId: string
}

export const DeleteOrganizationButton = ({
  orgId,
}: DeleteOrganizationButtonProps) => {
  const { mutate: deleteOrg, isPending } = useDeleteOrganization()
  const router = useRouter()

  const handleDelete = () => {
    deleteOrg(orgId, {
      onSuccess: () => {
        router.push(ROUTES.organizations)
      },
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' className='gap-2'>
          <Trash2 className='h-4 w-4' />
          Delete Organization
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            organization and remove all associated data including members,
            projects, and tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? 'Deleting...' : 'Delete Organization'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
