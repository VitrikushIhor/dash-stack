'use client'

import { useQueryState } from 'nuqs'
import { parseAsBoolean } from 'nuqs/server'

export function useInviteMemberModalStore() {
  const [isOpen, setIsOpen] = useQueryState(
    'invite-member',
    parseAsBoolean.withDefault(false)
  )

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(null),
  }
}
