export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = Exclude<Theme, 'system'>

export const DEFAULT_THEME: Theme = 'system'

export function isTheme(value: string | undefined): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system'
}

export function isResolvedTheme(
  value: string | undefined
): value is ResolvedTheme {
  return value === 'dark' || value === 'light'
}
