'use client'

import { createContext, useContext, useState } from 'react'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { setCookie } from '@/shared/lib/cookies'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
export type Variant = 'inset' | 'sidebar' | 'floating'

// Default values
export const DEFAULT_VARIANT = 'inset'
export const DEFAULT_COLLAPSIBLE = 'icon'

type LayoutContextType = {
  resetLayout: () => void

  defaultCollapsible: Collapsible
  collapsible: Collapsible
  setCollapsible: (collapsible: Collapsible) => void

  defaultVariant: Variant
  variant: Variant
  setVariant: (variant: Variant) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

type LayoutProviderProps = {
  children: React.ReactNode
  initialCollapsible?: Collapsible
  initialVariant?: Variant
}

export function LayoutProvider({
  children,
  initialCollapsible,
  initialVariant,
}: LayoutProviderProps) {
  const [collapsible, _setCollapsible] = useState<Collapsible>(
    initialCollapsible ?? DEFAULT_COLLAPSIBLE
  )

  const [variant, _setVariant] = useState<Variant>(
    initialVariant ?? DEFAULT_VARIANT
  )

  const setCollapsible = (newCollapsible: Collapsible) => {
    _setCollapsible(newCollapsible)
    setCookie(
      COOKIE_CONFIG.LAYOUT_COLLAPSIBLE.name,
      newCollapsible,
      COOKIE_CONFIG.LAYOUT_COLLAPSIBLE.maxAge
    )
  }

  const setVariant = (newVariant: Variant) => {
    _setVariant(newVariant)
    setCookie(
      COOKIE_CONFIG.LAYOUT_VARIANT.name,
      newVariant,
      COOKIE_CONFIG.LAYOUT_VARIANT.maxAge
    )
  }

  const resetLayout = () => {
    setCollapsible(DEFAULT_COLLAPSIBLE)
    setVariant(DEFAULT_VARIANT)
  }

  const contextValue: LayoutContextType = {
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    collapsible,
    setCollapsible,
    defaultVariant: DEFAULT_VARIANT,
    variant,
    setVariant,
  }

  return <LayoutContext value={contextValue}>{children}</LayoutContext>
}

// Define the hook for the provider
export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
