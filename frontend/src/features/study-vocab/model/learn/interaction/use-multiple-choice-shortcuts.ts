'use client'

import { useEffect, useRef } from 'react'
import { isInputActive } from '../../../lib/is-input-active'
import { type MultipleChoiceShortcutsOptions } from '../session/adaptive-session.contract'

export function useMultipleChoiceShortcuts({
  optionsCount,
  isDisabled,
  onSelectIndex,
}: MultipleChoiceShortcutsOptions) {
  const onSelectIndexRef = useRef(onSelectIndex)
  const isDisabledRef = useRef(isDisabled)
  const optionsCountRef = useRef(optionsCount)

  useEffect(() => {
    onSelectIndexRef.current = onSelectIndex
    isDisabledRef.current = isDisabled
    optionsCountRef.current = optionsCount
  }, [onSelectIndex, isDisabled, optionsCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isDisabledRef.current || isInputActive()) return

      const keyIndex = ['1', '2', '3', '4'].indexOf(e.key)
      if (keyIndex !== -1 && keyIndex < optionsCountRef.current) {
        e.preventDefault()
        onSelectIndexRef.current(keyIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
