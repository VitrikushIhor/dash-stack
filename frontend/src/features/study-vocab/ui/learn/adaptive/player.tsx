'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import { Button } from '@/shared/ui/core/button'
import { type AdaptiveLearnPlayerProps } from '../../../model/learn/adaptive-player.contract'
import { getLearnSessionProgress } from '../../../model/learn/session/adaptive-session'
import {
  LearnAnswerKind,
  LearnPhase,
  LearnStage,
} from '../../../model/learn/session/adaptive-session.constants'
import { useAdaptiveLearn } from '../../../model/learn/session/use-adaptive-session'
import { StudySessionSkeleton } from '../../shared/study-session-skeleton'
import { StudySessionView } from '../../shared/study-session-view'
import { AdaptiveLearnComplete, AdaptiveLearnIdle } from './boundaries'
import { AdaptiveLearnFeedback } from './feedback'
import { AdaptiveLearnQuestion } from './question'

export function AdaptiveLearnPlayer({
  deckId,
  cards,
  sessionKey,
}: AdaptiveLearnPlayerProps) {
  const learn = useAdaptiveLearn(deckId, cards, sessionKey)
  const { error, isLoading, start } = learn
  const snapshot = learn.snapshot
  const card = snapshot?.cards[snapshot.session.currentIndex]
  const mastery =
    snapshot?.session.cards[snapshot.session.currentIndex]?.mastery
  const feedback = snapshot?.feedback
  const mastered =
    snapshot?.session.cards.filter(
      (item) => item.mastery.stage === LearnStage.Mastered
    ).length ?? 0
  const options = snapshot?.choices ?? []
  const { speak } = useSpeech({ lang: 'en-US' })

  useEffect(() => {
    if (isLoading || snapshot || !cards.length || error) return

    start()
  }, [cards.length, error, isLoading, snapshot, start])

  useEffect(() => {
    if (!feedback || !snapshot?.session.questionId || !card?.term) return
    speak(card.term, { eventKey: snapshot.session.questionId })
  }, [card?.term, feedback, snapshot?.session.questionId, speak])

  if (isLoading || (!snapshot && cards.length > 0 && !error)) {
    return <StudySessionSkeleton />
  }

  if (!snapshot) {
    return <AdaptiveLearnIdle error={error} onRetry={learn.restart} />
  }

  if (snapshot.session.phase === LearnPhase.Complete) {
    return (
      <AdaptiveLearnComplete
        masteredCount={mastered}
        attemptCount={snapshot.session.attemptCount}
        onRestart={learn.restart}
      />
    )
  }

  if (!card || !mastery) return null
  const questionStage = snapshot.choices ? LearnStage.Mcq : LearnStage.Typing
  const sessionProgress = getLearnSessionProgress(snapshot.session)
  const progress = sessionProgress.total
    ? (sessionProgress.completed / sessionProgress.total) * 100
    : 100

  return (
    <StudySessionView>
      <StudySessionView.Progress progress={progress} />
      <StudySessionView.Header>
        <span>
          Mastery progress: {sessionProgress.completed} /{' '}
          {sessionProgress.total} steps
        </span>
        <span>
          {questionStage === LearnStage.Mcq
            ? 'Multiple choice'
            : 'Written answer'}{' '}
          ·{' '}
          {mastery.stage === LearnStage.Mastered
            ? 'mastered'
            : `streak ${mastery.streak} / 2`}
        </span>
      </StudySessionView.Header>
      <StudySessionView.Content>
        <div className='mx-auto w-full max-w-2xl' aria-live='polite'>
          <AdaptiveLearnQuestion
            key={snapshot.session.questionId}
            card={card}
            choices={options}
            phase={snapshot.session.phase}
            stage={questionStage}
            isSyncing={learn.isSyncing}
            feedback={feedback ?? null}
            onSelectChoice={(choiceId) =>
              void learn.answer({ kind: LearnAnswerKind.Mcq, choiceId })
            }
            onSubmitTyping={(value) =>
              void learn.answer({ kind: LearnAnswerKind.Typing, value })
            }
          />
          <AdaptiveLearnFeedback
            feedback={feedback ?? null}
            correctAnswer={
              questionStage === LearnStage.Mcq ? card.definition : card.term
            }
            error={learn.error}
            onRetry={() => void learn.retry()}
          />
        </div>
      </StudySessionView.Content>
      <StudySessionView.Footer>
        {feedback && (
          <Button
            onClick={learn.next}
            disabled={feedback.sync === 'pending' || learn.isSyncing}
          >
            {learn.isSyncing && <Loader2 className='h-4 w-4 animate-spin' />}{' '}
            Continue
          </Button>
        )}
      </StudySessionView.Footer>
    </StudySessionView>
  )
}
