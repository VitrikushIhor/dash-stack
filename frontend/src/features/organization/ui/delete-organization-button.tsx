import { useNavigate } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
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
} from '@/shared/ui/components/ui/alert-dialog'
import { Button } from '@/shared/ui/components/ui/button'
import { useDeleteOrganization } from '../api/hooks/use-delete-organization'

interface DeleteOrganizationButtonProps {
  orgId: string
}

export const DeleteOrganizationButton = ({
  orgId,
}: DeleteOrganizationButtonProps) => {
  const { mutate: deleteOrg, isPending } = useDeleteOrganization()
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteOrg(orgId, {
      onSuccess: () => {
        navigate({ to: '/organizations' })
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
            This action cannot be undone. This will permanently delete the
            organization and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
