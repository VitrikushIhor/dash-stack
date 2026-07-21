'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ConfirmDialog } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuthStore()

  const handleSignOut = () => {
    logout()
    const redirect = encodeURIComponent(pathname)
    router.replace(`/sign-in?redirect=${redirect}`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
