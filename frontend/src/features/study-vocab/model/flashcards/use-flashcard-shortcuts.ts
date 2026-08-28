'use client'

import { useEffect, useRef } from 'react'
import { isInputActive } from '../../lib/is-input-active'

const isFlipKey = (e: KeyboardEvent) => e.code === 'Space'
const isFailKey = (e: KeyboardEvent) => e.key === '1'
const isSuccessKey = (e: KeyboardEvent) => e.key === '2'

interface UseFlashcardShortcutsOptions {
  isFinished: boolean
  isFlipped: boolean
  onFlip: () => void
  onAnswer: (isCorrect: boolean) => void
}

export function useFlashcardShortcuts({
  isFinished,
  isFlipped,
  onFlip,
  onAnswer,
}: UseFlashcardShortcutsOptions) {
  const isFinishedRef = useRef(isFinished)
  const isFlippedRef = useRef(isFlipped)
  const onFlipRef = useRef(onFlip)
  const onAnswerRef = useRef(onAnswer)

  useEffect(() => {
    isFinishedRef.current = isFinished
    isFlippedRef.current = isFlipped
    onFlipRef.current = onFlip
    onAnswerRef.current = onAnswer
  }, [isFinished, isFlipped, onFlip, onAnswer])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isFinishedRef.current || isInputActive()) return

      if (isFlipKey(e)) {
        e.preventDefault()
        onFlipRef.current()
      } else if (isFlippedRef.current && isFailKey(e)) {
        onAnswerRef.current(false)
      } else if (isFlippedRef.current && isSuccessKey(e)) {
        onAnswerRef.current(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
