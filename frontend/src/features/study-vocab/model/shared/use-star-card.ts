'use client'

import { useCallback, useState } from 'react'
import { useAction } from '@/shared/lib'
import { toggleStarAction } from '../../server'

export function useStarCard(
  deckId: string,
  cardId: string,
  initialIsStarred: boolean
) {
  const [isStarred, setIsStarred] = useState(initialIsStarred)
  const [prevCardId, setPrevCardId] = useState(cardId)
  const [prevInitialStarred, setPrevInitialStarred] = useState(initialIsStarred)
  const { execute } = useAction(toggleStarAction)

  if (cardId !== prevCardId || initialIsStarred !== prevInitialStarred) {
    setPrevCardId(cardId)
    setPrevInitialStarred(initialIsStarred)
    setIsStarred(initialIsStarred)
  }

  const toggleStar = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      let nextValue = false
      setIsStarred((prev) => {
        nextValue = !prev
        return nextValue
      })

      const result = await execute({ deckId, cardId, isStarred: nextValue })
      if (result === undefined) {
        setIsStarred((curr) => (curr === nextValue ? !nextValue : curr))
      }
    },
    [deckId, cardId, execute]
  )

  return { isStarred, toggleStar }
}
