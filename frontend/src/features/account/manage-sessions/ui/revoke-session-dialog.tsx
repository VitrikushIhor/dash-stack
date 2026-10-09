'use client'

import { toast } from 'sonner'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'
import { useRevokeSession } from '../model/mutations/use-revoke-session'
import { useSessionSearchParams } from '../model/session-search-params'
import type { ActiveSession } from '../model/types/active-sessions.types'

export function RevokeSessionDialog({
  sessions,
}: {
  sessions: ActiveSession[]
}) {
  const [searchParams, setSearchParams] = useSessionSearchParams()
  const { revokeSession, isPending, error, resetError } = useRevokeSession()
  const selectedSession = sessions.find(
    (session) => session.id === searchParams['revoke-session']
  )

  const handleConfirm = () => {
    if (!selectedSession || isPending) return

    revokeSession(selectedSession.id, async () => {
      await setSearchParams({ 'revoke-session': null })
      toast.success('Session signed out. Other sessions remain active.')
    })
  }

  return (
    <UrlConfirmDialog.Root
      queryKey='revoke-session'
      enabled={selectedSession !== undefined}
      onClose={resetError}
      confirmText={isPending ? 'Signing out…' : 'Confirm sign out'}
      destructive
      isLoading={isPending}
      handleConfirm={handleConfirm}
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title>Sign out this session?</UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          {selectedSession?.isCurrent
            ? 'You will be signed out in this browser and its other tabs.'
            : 'This session will lose access. It will need to sign in again.'}
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
      {error && (
        <UrlConfirmDialog.ErrorMessage>{error}</UrlConfirmDialog.ErrorMessage>
      )}
    </UrlConfirmDialog.Root>
  )
}
