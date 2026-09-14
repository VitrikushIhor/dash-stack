'use client'

import { useEffect, useRef } from 'react'
import { isInputActive } from '../../lib/is-input-active'

const isFlipKey = (e: KeyboardEvent) => e.code === 'Space'
const isFailKey = (e: KeyboardEvent) => e.key === '1'
const isSuccessKey = (e: KeyboardEvent) => e.key === '2'
const isReplayKey = (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j'

interface UseFlashcardShortcutsOptions {
  isFinished: boolean
  isFlipped: boolean
  onFlip: () => void
  onAnswer: (isCorrect: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onStar: () => void
  onReplay: () => void
}

export function useFlashcardShortcuts({
  isFinished,
  isFlipped,
  onFlip,
  onAnswer,
  onPrevious,
  onNext,
  onStar,
  onReplay,
}: UseFlashcardShortcutsOptions) {
  const isFinishedRef = useRef(isFinished)
  const isFlippedRef = useRef(isFlipped)
  const onFlipRef = useRef(onFlip)
  const onAnswerRef = useRef(onAnswer)
  const onPreviousRef = useRef(onPrevious)
  const onNextRef = useRef(onNext)
  const onStarRef = useRef(onStar)
  const onReplayRef = useRef(onReplay)

  useEffect(() => {
    isFinishedRef.current = isFinished
    isFlippedRef.current = isFlipped
    onFlipRef.current = onFlip
    onAnswerRef.current = onAnswer
    onPreviousRef.current = onPrevious
    onNextRef.current = onNext
    onStarRef.current = onStar
    onReplayRef.current = onReplay
  }, [
    isFinished,
    isFlipped,
    onFlip,
    onAnswer,
    onPrevious,
    onNext,
    onStar,
    onReplay,
  ])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isFinishedRef.current || isInputActive()) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onPreviousRef.current()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNextRef.current()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onStarRef.current()
      } else if (isReplayKey(e)) {
        e.preventDefault()
        onReplayRef.current()
      } else if (isFlipKey(e) || e.key === ' ') {
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
