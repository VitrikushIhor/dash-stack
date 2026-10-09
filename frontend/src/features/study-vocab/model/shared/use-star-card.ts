'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import { AUTH_STATE_STATUS, useCurrentUserState } from '@/entities/user'
import { toggleStarAction } from '../../server'

const STAR_COOLDOWN_MS = 1000

export function useStarCard(
  deckId: string,
  cardId: string,
  initialIsStarred: boolean
) {
  const { authState } = useCurrentUserState()
  const pathname = usePathname()
  const router = useRouter()
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

  const promptGuestSignIn = useCallback(() => {
    toast.info('Sign in to save starred cards.', {
      action: {
        label: 'Sign in',
        onClick: () =>
          router.push(
            pathname
              ? `${ROUTES.signIn}?redirect=${encodeURIComponent(pathname)}`
              : ROUTES.signIn
          ),
      },
    })
  }, [pathname, router])

  const toggleStar = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (authState.status === AUTH_STATE_STATUS.GUEST) {
        promptGuestSignIn()
        return
      }
      if (
        authState.status !== AUTH_STATE_STATUS.AUTHENTICATED ||
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

        setStarredOverrides((previous) => ({
          ...previous,
          [cardId]: result?.isStarred ?? isStarred,
        }))
      } finally {
        pendingCardsRef.current.delete(cardId)
        setPendingCards(new Set(pendingCardsRef.current))
      }
    },
    [authState.status, cardId, deckId, execute, isStarred, promptGuestSignIn]
  )

  return {
    isStarred,
    toggleStar,
    isPending: pendingCards.has(cardId),
    isDisabled:
      authState.status === AUTH_STATE_STATUS.LOADING ||
      authState.status === AUTH_STATE_STATUS.ERROR ||
      pendingCards.has(cardId) ||
      isCoolingDown,
  }
}
