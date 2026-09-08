'use client'

import { useTransition } from 'react'
import { useQueryStates } from 'nuqs'
import { studySearchParams } from './search-params'

export function useStudySearchParams() {
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useQueryStates(studySearchParams, {
    shallow: false,
    history: 'push',
    startTransition,
  })
  return { filters, setFilters, isPending }
}
