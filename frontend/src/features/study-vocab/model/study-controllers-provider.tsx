'use client'

import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { createFlashcardGameStore } from './flashcards/game/flashcard-game.store'
import { createFlashcardProgressStore } from './flashcards/session/flashcard-progress.store'
import { createFlashcardSessionStore } from './flashcards/session/flashcard-session.store'
import { createAdaptiveLearnStore } from './learn/session/adaptive-session.store'
import { createMatchGameStore } from './match/game/match-game.store'
import { createMatchSessionStore } from './match/session/match-session.store'

const defaultFactories = {
  flashcardGame: createFlashcardGameStore,
  flashcardProgress: createFlashcardProgressStore,
  flashcardSession: createFlashcardSessionStore,
  learnSession: createAdaptiveLearnStore,
  matchGame: createMatchGameStore,
  matchSession: createMatchSessionStore,
}

export type StudyControllerFactories = typeof defaultFactories

const StudyControllersContext =
  createContext<StudyControllerFactories>(defaultFactories)

export function StudyControllersProvider({
  children,
  factories,
}: {
  children: ReactNode
  factories?: Partial<StudyControllerFactories>
}) {
  const parent = useContext(StudyControllersContext)
  const value = useMemo(
    () => ({ ...parent, ...factories }),
    [factories, parent]
  )

  return (
    <StudyControllersContext.Provider value={value}>
      {children}
    </StudyControllersContext.Provider>
  )
}

export function useStudyControllerFactories() {
  return useContext(StudyControllersContext)
}
