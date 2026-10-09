export function normalizeDeckTag(value: string): string {
  return value.trim().toLowerCase().replace(/^#/, '')
}

export function addDeckTag(tags: string[], value: string): string[] {
  const tag = normalizeDeckTag(value)

  return tag && !tags.includes(tag) ? [...tags, tag] : tags
}

export function removeDeckTag(tags: string[], value: string): string[] {
  return tags.filter((tag) => tag !== value)
}
