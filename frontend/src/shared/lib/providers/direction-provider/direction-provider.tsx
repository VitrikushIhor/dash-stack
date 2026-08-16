'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction'
import { getCookie, removeCookie, setCookie } from '@/shared/lib/cookies'
import {
  DEFAULT_DIRECTION,
  DIRECTION_COOKIE_MAX_AGE,
  DIRECTION_COOKIE_NAME,
  isDirection,
  type Direction,
} from './direction-utils'

type DirectionContextValue = {
  dir: Direction
  defaultDir: Direction
  setDir: (dir: Direction) => void
  resetDir: () => void
}

const DirectionContext = createContext<DirectionContextValue | null>(null)

function getInitialDirection(): Direction {
  if (typeof document === 'undefined') {
    return DEFAULT_DIRECTION
  }

  const attr = document.documentElement.getAttribute('dir')

  if (isDirection(attr)) {
    return attr
  }

  const savedDir = getCookie(DIRECTION_COOKIE_NAME)

  return isDirection(savedDir) ? savedDir : DEFAULT_DIRECTION
}

function applyDirection(dir: Direction): void {
  document.documentElement.setAttribute('dir', dir)
}

/**
 * TODO: i18n Integration
 * After adding next-intl, this provider should be heavily simplified.
 * It should not maintain internal state or interact with cookies.
 * It should only receive the current `dir` as a prop from the server-side layout.tsx
 * and pass it down to <RadixDirectionProvider>.
 */
export function DirectionProvider({ children }: PropsWithChildren) {
  const [dir, setDirState] = useState<Direction>(getInitialDirection)

  const setDir = useCallback((nextDir: Direction) => {
    setDirState(nextDir)
    applyDirection(nextDir)
    setCookie(DIRECTION_COOKIE_NAME, nextDir, DIRECTION_COOKIE_MAX_AGE)
  }, [])

  const resetDir = useCallback(() => {
    setDirState(DEFAULT_DIRECTION)
    applyDirection(DEFAULT_DIRECTION)
    removeCookie(DIRECTION_COOKIE_NAME)
  }, [])

  const value = useMemo<DirectionContextValue>(
    () => ({
      dir,
      defaultDir: DEFAULT_DIRECTION,
      setDir,
      resetDir,
    }),
    [dir, resetDir, setDir]
  )

  return (
    <DirectionContext.Provider value={value}>
      <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>
    </DirectionContext.Provider>
  )
}

export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext)

  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider')
  }

  return context
}
