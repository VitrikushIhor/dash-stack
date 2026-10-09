import { answerLearnQuestion } from '../session/adaptive-session'
import {
  LearnAnswerKind,
  LearnPhase,
  LearnStage,
} from '../session/adaptive-session.constants'
import {
  type LearnAnswer,
  type LearnFeedbackSync,
  type LearnSnapshot,
} from '../session/adaptive-session.contract'
import { evaluateLearnAnswer } from './answer-evaluation'

export function answerAdaptiveLearnQuestion(
  snapshot: LearnSnapshot,
  answer: LearnAnswer,
  sync: LearnFeedbackSync
): LearnSnapshot | null {
  if (snapshot.session.phase !== LearnPhase.Question) return null

  const card = snapshot.cards[snapshot.session.currentIndex]
  const mastery = snapshot.session.cards[snapshot.session.currentIndex]?.mastery

  if (!card || !mastery || mastery.stage === LearnStage.Mastered) return null
  if (answer.kind !== mastery.stage) return null

  const selectedChoice =
    answer.kind === LearnAnswerKind.Mcq
      ? snapshot.choices?.find((choice) => choice.id === answer.choiceId)
      : null

  if (answer.kind === LearnAnswerKind.Mcq && !selectedChoice) return null

  const evaluation =
    answer.kind === LearnAnswerKind.Mcq
      ? {
          isCorrect: selectedChoice?.id === card.id,
          kind:
            selectedChoice?.id === card.id
              ? ('exact' as const)
              : ('incorrect' as const),
        }
      : evaluateLearnAnswer(answer.value, card.term)
  const submittedAnswer =
    answer.kind === LearnAnswerKind.Mcq
      ? (selectedChoice?.definition ?? '')
      : answer.value

  return {
    ...snapshot,
    session: answerLearnQuestion(
      snapshot.session,
      snapshot.session.questionId,
      evaluation.isCorrect
    ),
    feedback: {
      answer: submittedAnswer,
      kind: evaluation.kind,
      sync,
    },
  }
}
