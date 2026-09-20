'use client'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { useLogout } from '../model/mutations/use-logout-hook'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { handleLogout } = useLogout()

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleLogout}
      className='sm:max-w-sm'
    />
  )
}
