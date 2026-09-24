export function normalizeDeckTag(value: string): string {
  return value.trim().toLowerCase().replace(/^#/, '')
}
