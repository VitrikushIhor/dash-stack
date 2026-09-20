import { isTermMatch } from '../../../lib/is-term-match'
import { type LearnAnswerEvaluation } from '../session/adaptive-session.contract'

export function normalizeLearnAnswer(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
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
  if (isTermMatch(normalizedAnswer, normalizedExpected)) {
    return { kind: 'normalized', isCorrect: true }
  }

  return { kind: 'incorrect', isCorrect: false }
}
