import { isTermMatch } from '../../../lib/is-term-match'
import { LearnAnswerEvaluationKind } from '../session/adaptive-session.constants'
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
    return { kind: LearnAnswerEvaluationKind.Incorrect, isCorrect: false }
  }
  if (answer === expected)
    return { kind: LearnAnswerEvaluationKind.Exact, isCorrect: true }
  if (normalizedAnswer === normalizedExpected) {
    return { kind: LearnAnswerEvaluationKind.Normalized, isCorrect: true }
  }
  if (isTermMatch(normalizedAnswer, normalizedExpected)) {
    return { kind: LearnAnswerEvaluationKind.Normalized, isCorrect: true }
  }

  return { kind: LearnAnswerEvaluationKind.Incorrect, isCorrect: false }
}
