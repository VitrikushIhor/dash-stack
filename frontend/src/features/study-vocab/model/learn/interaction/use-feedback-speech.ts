'use client'

import { useEffect, useRef } from 'react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import { type LearnFeedbackSpeechParams } from '../session/adaptive-session.contract'

export function useLearnFeedbackSpeech({
  feedback,
  questionId,
  term,
}: LearnFeedbackSpeechParams): void {
  const spokenQuestionId = useRef<string | null>(null)
  const { speak } = useSpeech({ lang: 'en-US' })

  useEffect(() => {
    if (!feedback || !questionId || !term) return
    if (spokenQuestionId.current === questionId) return
    spokenQuestionId.current = questionId
    speak(term)
  }, [feedback, questionId, speak, term])
}
