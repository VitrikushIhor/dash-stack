'use client'

import { useQueryState } from 'nuqs'
import { parseAsBoolean } from 'nuqs/server'

export function useCreateOrganizationModalStore() {
  const [isOpen, setIsOpen] = useQueryState(
    'create-organization',
    parseAsBoolean.withDefault(false)
  )

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(null),
  }
}
