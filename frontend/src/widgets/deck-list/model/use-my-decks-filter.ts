import { useMemo, useTransition } from 'react'
import { type Deck, DeckStatusEnum } from '@/entities/deck'
import { FilterTabEnum } from './search-params'
import { useMyDecksSearchParams } from './use-search-params'

export type FilterTab = keyof typeof FilterTabEnum

export function useMyDecksFilter(initialDecks: Deck[]) {
  const [params, setParams] = useMyDecksSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setParams({ q: value || null }, { throttleMs: 300 })
    })
  }

  const decks = useMemo(() => initialDecks ?? [], [initialDecks])

  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      if (
        params.tab === FilterTabEnum.PUBLISHED &&
        deck.status !== DeckStatusEnum.PUBLISHED
      )
        return false
      if (
        params.tab === FilterTabEnum.DRAFT &&
        deck.status !== DeckStatusEnum.DRAFT
      )
        return false
      if (
        params.tab === FilterTabEnum.ARCHIVED &&
        deck.status !== DeckStatusEnum.ARCHIVED
      )
        return false
      if (
        params.tab === FilterTabEnum.ALL &&
        deck.status === DeckStatusEnum.ARCHIVED
      )
        return false

      if (params.q.trim()) {
        const query = params.q.toLowerCase()
        const titleMatch = deck.title.toLowerCase().includes(query)
        const descMatch = deck.description?.toLowerCase().includes(query)
        const tagMatch = deck.tags.some((t) => t.toLowerCase().includes(query))

        return titleMatch || descMatch || tagMatch
      }

      return true
    })
  }, [decks, params.tab, params.q])

  const counts = useMemo(() => {
    const published = decks.filter(
      (d) => d.status === DeckStatusEnum.PUBLISHED
    ).length

    const draft = decks.filter((d) => d.status === DeckStatusEnum.DRAFT).length
    const archived = decks.filter(
      (d) => d.status === DeckStatusEnum.ARCHIVED
    ).length

    const activeTotal = published + draft

    return { all: activeTotal, published, draft, archived }
  }, [decks])

  const handleTabChange = (tab: FilterTab) => {
    startTransition(() => {
      setParams({ tab })
    })
  }

  return {
    activeTab: params.tab,
    setActiveTab: handleTabChange,
    searchQuery: params.q,
    setSearchQuery: handleSearchChange,
    isPending,
    filteredDecks,
    counts,
  }
}
