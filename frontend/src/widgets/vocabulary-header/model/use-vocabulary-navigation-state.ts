'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/shared/config'

export function useVocabularyNavigationState() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isCreateDeck =
    pathname === ROUTES.vocabDecks && searchParams.get('create-deck') === 'true'

  return {
    isCatalog: pathname === ROUTES.vocabCatalog,
    isMyDecks: pathname.startsWith(ROUTES.vocabDecks) && !isCreateDeck,
    isCreateDeck,
  }
}
