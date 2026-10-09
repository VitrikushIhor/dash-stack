'use client'

import { useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { parseAsString } from 'nuqs/server'

const MAX_SEARCH_LENGTH = 100

export function useDeckBoardSearch() {
  const [urlSearch, setUrlSearch] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      history: 'replace',
      shallow: true,
    })
  )

  const setSearch = useCallback(
    (value: string) => {
      void setUrlSearch(value.slice(0, MAX_SEARCH_LENGTH) || null)
    },
    [setUrlSearch]
  )

  return { search: urlSearch.slice(0, MAX_SEARCH_LENGTH), setSearch }
}
