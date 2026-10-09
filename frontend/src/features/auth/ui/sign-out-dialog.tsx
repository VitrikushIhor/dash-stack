'use client'

import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'
import { useLogout } from '../model/mutations/use-logout-hook'

export function SignOutDialog() {
  const { handleLogout } = useLogout()

  return (
    <UrlConfirmDialog.Root
      queryKey='sign-out'
      confirmText='Sign out'
      destructive
      handleConfirm={handleLogout}
      className='sm:max-w-sm'
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title>Sign out</UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          Are you sure you want to sign out? You will need to sign in again to
          access your account.
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
    </UrlConfirmDialog.Root>
  )
}
