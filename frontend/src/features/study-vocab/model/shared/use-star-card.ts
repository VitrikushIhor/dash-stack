'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib'
import { useCurrentUser } from '@/entities/user'
import { toggleStarAction } from '../../server'

const STAR_COOLDOWN_MS = 1000

export function useStarCard(cardId: string, initialIsStarred: boolean) {
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

      // TODO(auth-refactor): keep this guard only until the auth hook exposes
      // a stable guest state and a dedicated sign-in action for protected mutations.
      if (user === null) {
        toast.info('Sign in to save starred cards.')

        return
      }
      if (
        user === undefined ||
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
        const result = await execute({ cardId, isStarred: nextValue })

        setStarredOverrides((previous) => ({
          ...previous,
          [cardId]: result?.isStarred ?? isStarred,
        }))
      } finally {
        pendingCardsRef.current.delete(cardId)
        setPendingCards(new Set(pendingCardsRef.current))
      }
    },
    [cardId, execute, isStarred, user]
  )

  return {
    isStarred,
    toggleStar,
    isPending: pendingCards.has(cardId),
    isDisabled: user === undefined || pendingCards.has(cardId) || isCoolingDown,
  }
}
