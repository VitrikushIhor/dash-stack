import { createLearnChoices } from '../answer/answer-options'
import { LearnPhase, LearnStage } from './adaptive-session.constants'
import {
  type AdaptiveLearnSession,
  type LearnChoice,
  type LearnMastery,
} from './adaptive-session.contract'

export function createLearnSession(
  sessionId: string,
  cards: readonly LearnChoice[]
): AdaptiveLearnSession {
  return {
    sessionId,
    cards: cards.map((card) => {
      const requiresMcq = Boolean(createLearnChoices(card, cards))

      return {
        id: card.id,
        requiresMcq,
        mastery: {
          stage: requiresMcq ? LearnStage.Mcq : LearnStage.Typing,
          streak: 0,
        },
        incorrectCount: 0,
      }
    }),
    currentIndex: 0,
    questionId: `${sessionId}:0`,
    attemptCount: 0,
    phase: cards.length ? LearnPhase.Question : LearnPhase.Complete,
  }
}

function advanceMastery(
  card: Pick<AdaptiveLearnSession['cards'][number], 'mastery' | 'requiresMcq'>,
  isCorrect: boolean
): LearnMastery {
  const { mastery } = card

  if (mastery.stage === LearnStage.Mastered) return mastery
  if (!isCorrect) {
    return {
      stage: card.requiresMcq ? LearnStage.Mcq : LearnStage.Typing,
      streak: 0,
    }
  }
  if (mastery.stage === LearnStage.Mcq)
    return { stage: LearnStage.Typing, streak: 1 }
  if (mastery.streak === 0) return { stage: LearnStage.Typing, streak: 1 }

  return { stage: LearnStage.Mastered }
}

export function answerLearnQuestion(
  session: AdaptiveLearnSession,
  questionId: string,
  isCorrect: boolean
): AdaptiveLearnSession {
  if (
    session.phase !== LearnPhase.Question ||
    session.questionId !== questionId
  ) {
    return session
  }

  return {
    ...session,
    cards: session.cards.map((card, index) =>
      index === session.currentIndex
        ? {
            ...card,
            mastery: advanceMastery(card, isCorrect),
            incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
          }
        : card
    ),
    attemptCount: session.attemptCount + 1,
    phase: LearnPhase.Feedback,
  }
}

export function continueLearnSession(
  session: AdaptiveLearnSession
): AdaptiveLearnSession {
  if (session.phase !== LearnPhase.Feedback) return session
  const currentCard = session.cards[session.currentIndex]

  if (
    currentCard?.mastery.stage === LearnStage.Typing &&
    currentCard.mastery.streak === 1
  ) {
    return {
      ...session,
      questionId: `${session.sessionId}:${session.attemptCount}`,
      phase: LearnPhase.Question,
    }
  }
  for (let offset = 1; offset <= session.cards.length; offset += 1) {
    const index = (session.currentIndex + offset) % session.cards.length

    if (session.cards[index].mastery.stage !== LearnStage.Mastered) {
      return {
        ...session,
        currentIndex: index,
        questionId: `${session.sessionId}:${session.attemptCount}`,
        phase: LearnPhase.Question,
      }
    }
  }

  return { ...session, phase: LearnPhase.Complete }
}

export function getLearnSessionProgress(session: AdaptiveLearnSession): {
  completed: number
  total: number
} {
  const completed = session.cards.reduce(
    (count, card) =>
      count +
      (card.mastery.stage === LearnStage.Mastered
        ? 2
        : card.mastery.stage === LearnStage.Typing
          ? 1
          : 0),
    0
  )

  return { completed, total: session.cards.length * 2 }
}
