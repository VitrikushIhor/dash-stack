const normalize = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase()

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

  // Parse "baseTerm (form1, form2, ...)" pattern
  const match = normalizedTerm.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*$/)

  if (!match) return false

  const baseTerm = normalize(match[1])
  const forms = match[2] ? match[2].split(',').map((f) => normalize(f)) : []

  const allAcceptable = [baseTerm, ...forms]

  return allAcceptable.some((form) => form === normalizedAnswer)
}
