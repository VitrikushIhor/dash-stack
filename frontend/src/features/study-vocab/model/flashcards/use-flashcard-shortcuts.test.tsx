import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFlashcardShortcuts } from './use-flashcard-shortcuts'

function dispatchKey(key: string, options: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...options }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useFlashcardShortcuts', () => {
  it('maps navigation, flip, answer, star and pronunciation shortcuts', () => {
    const onFlip = vi.fn()
    const onAnswer = vi.fn()
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    const onStar = vi.fn()
    const onReplay = vi.fn()

    renderHook(() =>
      useFlashcardShortcuts({
        isFinished: false,
        isFlipped: true,
        onFlip,
        onAnswer,
        onPrevious,
        onNext,
        onStar,
        onReplay,
      })
    )

    act(() => {
      dispatchKey('ArrowLeft')
      dispatchKey('ArrowRight')
      dispatchKey(' ')
      dispatchKey('ArrowUp')
      dispatchKey('j', { ctrlKey: true })
      dispatchKey('1')
      dispatchKey('2')
    })

    expect(onPrevious).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
    expect(onFlip).toHaveBeenCalledOnce()
    expect(onStar).toHaveBeenCalledOnce()
    expect(onReplay).toHaveBeenCalledOnce()
    expect(onAnswer).toHaveBeenNthCalledWith(1, false)
    expect(onAnswer).toHaveBeenNthCalledWith(2, true)
  })

  it('does not run shortcuts while an input, select, contenteditable or control is active', () => {
    const onFlip = vi.fn()
    const onAnswer = vi.fn()
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    const onStar = vi.fn()
    const onReplay = vi.fn()

    renderHook(() =>
      useFlashcardShortcuts({
        isFinished: false,
        isFlipped: true,
        onFlip,
        onAnswer,
        onPrevious,
        onNext,
        onStar,
        onReplay,
      })
    )
    const controls = ['input', 'textarea', 'select', 'button']

    for (const tagName of controls) {
      const control = document.createElement(tagName)

      document.body.appendChild(control)
      control.focus()
      act(() => dispatchKey('ArrowRight'))
      control.remove()
    }
    const editable = document.createElement('div')

    editable.setAttribute('contenteditable', 'true')
    editable.tabIndex = 0
    document.body.appendChild(editable)
    editable.focus()
    act(() => dispatchKey('ArrowUp'))

    expect(onFlip).not.toHaveBeenCalled()
    expect(onAnswer).not.toHaveBeenCalled()
    expect(onPrevious).not.toHaveBeenCalled()
    expect(onNext).not.toHaveBeenCalled()
    expect(onStar).not.toHaveBeenCalled()
    expect(onReplay).not.toHaveBeenCalled()
  })
})
