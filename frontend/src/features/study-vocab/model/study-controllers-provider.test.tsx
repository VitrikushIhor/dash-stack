import { type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createFlashcardGameStore } from './flashcards/game/flashcard-game.store'
import { useFlashcards } from './flashcards/game/use-flashcards'
import {
  type StudyControllerFactories,
  StudyControllersProvider,
} from './study-controllers-provider'

const factories: Partial<StudyControllerFactories> = {
  flashcardGame: (sessionKey, cardIds) => {
    const controller = createFlashcardGameStore(sessionKey, cardIds)
    controller.getState().flip()

    return controller
  },
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <StudyControllersProvider factories={factories}>
      {children}
    </StudyControllersProvider>
  )
}

describe('StudyControllersProvider', () => {
  it('should_use_the_injected_controller_factory_when_a_provider_overrides_it', () => {
    const { result } = renderHook(() => useFlashcards([], () => undefined), {
      wrapper,
    })
    expect(result.current.isFlipped).toBe(true)
  })

  it('should_isolate_player_state_when_two_providers_use_the_same_factory', () => {
    const first = renderHook(() => useFlashcards([], () => undefined), {
      wrapper,
    })
    const second = renderHook(() => useFlashcards([], () => undefined), {
      wrapper,
    })

    act(() => first.result.current.flipCard())

    expect(first.result.current.isFlipped).toBe(false)
    expect(second.result.current.isFlipped).toBe(true)
  })
})
