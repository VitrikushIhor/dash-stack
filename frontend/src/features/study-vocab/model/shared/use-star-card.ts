'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAction } from '@/shared/lib'
import { useCurrentUser } from '@/entities/user'
import { toggleStarAction } from '../../server'

const STAR_COOLDOWN_MS = 1000

export function useStarCard(
  deckId: string,
  cardId: string,
  initialIsStarred: boolean
) {
  const { data: user } = useCurrentUser()
  const nextAllowedAtRef = useRef(0)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  useEffect(
    () => () => {
      if (cooldownTimerRef.current !== null)
        clearTimeout(cooldownTimerRef.current)
    },
    []
  )
  const pendingCardsRef = useRef(new Set<string>())
  const [pendingCards, setPendingCards] = useState<ReadonlySet<string>>(
    new Set()
  )
  const [starredOverrides, setStarredOverrides] = useState<
    Record<string, boolean>
  >({})
  const { execute } = useAction(toggleStarAction)
  const isStarred = starredOverrides[cardId] ?? initialIsStarred

  const toggleStar = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (
        user === null ||
        pendingCardsRef.current.has(cardId) ||
        Date.now() < nextAllowedAtRef.current
      )
        return
      nextAllowedAtRef.current = Date.now() + STAR_COOLDOWN_MS
      setIsCoolingDown(true)
      cooldownTimerRef.current = setTimeout(
        () => setIsCoolingDown(false),
        STAR_COOLDOWN_MS
      )
      pendingCardsRef.current.add(cardId)
      setPendingCards(new Set(pendingCardsRef.current))

      const nextValue = !isStarred
      setStarredOverrides((previous) => ({
        ...previous,
        [cardId]: nextValue,
      }))

      try {
        const result = await execute({ deckId, cardId, isStarred: nextValue })
        if (result === undefined) {
          setStarredOverrides((previous) => {
            const remainingOverrides = { ...previous }
            remainingOverrides[cardId] = isStarred
            return remainingOverrides
          })
        }
      } finally {
        pendingCardsRef.current.delete(cardId)
        setPendingCards(new Set(pendingCardsRef.current))
      }
    },
    [cardId, deckId, execute, isStarred, user]
  )

  return {
    isStarred,
    toggleStar,
    isPending: pendingCards.has(cardId),
    isDisabled: pendingCards.has(cardId) || isCoolingDown,
  }
}
