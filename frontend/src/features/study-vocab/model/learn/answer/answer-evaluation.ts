import { type LearnAnswerEvaluation } from '../session/adaptive-session.contract'

export function normalizeLearnAnswer(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function levenshteinDistance(left: string, right: string): number {
  const source = Array.from(left)
  const target = Array.from(right)
  let previous = target.map((_, index) => index + 1)

  previous.unshift(0)

  for (let row = 1; row <= source.length; row += 1) {
    const current = [row]

    for (let column = 1; column <= target.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (source[row - 1] === target[column - 1] ? 0 : 1)
      )
    }
    previous = current
  }

  return previous[target.length]
}

export function evaluateLearnAnswer(
  answer: string,
  expected: string
): LearnAnswerEvaluation {
  const normalizedAnswer = normalizeLearnAnswer(answer)
  const normalizedExpected = normalizeLearnAnswer(expected)

  if (!normalizedAnswer || !normalizedExpected) {
    return { kind: 'incorrect', isCorrect: false }
  }
  if (answer === expected) return { kind: 'exact', isCorrect: true }
  if (normalizedAnswer === normalizedExpected) {
    return { kind: 'normalized', isCorrect: true }
  }
  if (levenshteinDistance(normalizedAnswer, normalizedExpected) <= 2) {
    return { kind: 'almost', isCorrect: true }
  }

  return { kind: 'incorrect', isCorrect: false }
}
