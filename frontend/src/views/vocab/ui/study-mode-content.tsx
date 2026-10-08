'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { StudyMode } from '@/entities/vocab'
import { StudySessionSkeleton } from '@/features/study-vocab/session-ui'
import type { StudyContentProps, StudyRouteMode } from '../model/study-route'

const studyModeComponents = {
  [StudyMode.FLASHCARDS]: dynamic<StudyContentProps>(
    () =>
      import('@/widgets/vocab-flashcards').then((mod) => mod.VocabFlashcards),
    { loading: () => <StudySessionSkeleton /> }
  ),
  [StudyMode.LEARN]: dynamic<StudyContentProps>(
    () => import('@/widgets/vocab-learn').then((mod) => mod.VocabLearn),
    { loading: () => <StudySessionSkeleton /> }
  ),
  [StudyMode.MATCH]: dynamic<StudyContentProps>(
    () => import('@/widgets/vocab-match').then((mod) => mod.VocabMatch),
    { loading: () => <StudySessionSkeleton /> }
  ),
} satisfies Record<StudyRouteMode, ComponentType<StudyContentProps>>

export function StudyModeContent({
  mode,
  ...props
}: StudyContentProps & { mode: StudyRouteMode }) {
  const Content = studyModeComponents[mode]
  return <Content {...props} />
}
