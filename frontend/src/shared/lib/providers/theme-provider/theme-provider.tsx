'use client'

import React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps as NextThemesProviderProps,
} from 'next-themes'
import {
  DEFAULT_THEME,
  isResolvedTheme,
  isTheme,
  type ResolvedTheme,
  type Theme,
} from './theme-utils'

export type ThemeProviderProps = NextThemesProviderProps

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const {
    setTheme,
    theme: rawTheme,
    resolvedTheme: rawResolvedTheme,
    systemTheme,
    themes,
    forcedTheme,
  } = useNextTheme()

  const resetTheme = React.useCallback(() => {
    setTheme(DEFAULT_THEME)
  }, [setTheme])

  const theme: Theme = isTheme(rawTheme) ? rawTheme : DEFAULT_THEME
  const resolvedTheme: ResolvedTheme = isResolvedTheme(rawResolvedTheme)
    ? rawResolvedTheme
    : 'light'

  return React.useMemo(
    () => ({
      setTheme,
      defaultTheme: DEFAULT_THEME,
      theme,
      resolvedTheme,
      resetTheme,
      systemTheme,
      themes,
      forcedTheme,
    }),
    [
      setTheme,
      theme,
      resolvedTheme,
      resetTheme,
      systemTheme,
      themes,
      forcedTheme,
    ]
  )
}
