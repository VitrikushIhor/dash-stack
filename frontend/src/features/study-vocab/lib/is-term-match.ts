const normalize = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase()

function getTermVariants(term: string): string[] | null {
  const openingParenthesis = term.indexOf('(')
  const hasClosingParenthesis = term.includes(')')

  if (openingParenthesis === -1) {
    return hasClosingParenthesis ? null : term.split(',').map(normalize)
  }

  if (!term.endsWith(')')) return null

  const baseTerm = term.slice(0, openingParenthesis).trim()
  const parenthesizedForms = term.slice(openingParenthesis + 1, -1)

  if (!baseTerm || !parenthesizedForms || parenthesizedForms.includes(')')) {
    return null
  }

  return [...baseTerm.split(','), ...parenthesizedForms.split(',')].map(
    normalize
  )
}

/**
 * Checks if a user's answer matches the term.
 *
 * Handles compound terms like "buy (bought, bought)":
 * - Accepts the full term: "buy (bought, bought)"
 * - Accepts the base word: "buy"
 * - Accepts any form listed in parentheses: "bought"
 *
 * For simple terms like "apple", only exact match works.
 */
export function isTermMatch(answer: string, term: string): boolean {
  const normalizedAnswer = normalize(answer)
  const normalizedTerm = normalize(term)

  if (!normalizedAnswer) return false

  // Exact full match
  if (normalizedAnswer === normalizedTerm) return true

  const variants = getTermVariants(normalizedTerm)

  return variants?.filter(Boolean).includes(normalizedAnswer) ?? false
}
