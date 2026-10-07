import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  StudyPage,
  type StudyRouteMode,
  type StudyRouteProps,
  isStudyRouteMode,
} from '@/views/vocab/study'

type StudyModeRouteProps = Omit<StudyRouteProps, 'params'> & {
  params: Promise<{ id: string; mode: string }>
}

const studyMetadata = {
  flashcards: {
    title: 'Flashcards',
    description: 'Study vocabulary flashcards with spaced repetition.',
  },
  learn: {
    title: 'Learn Mode',
    description:
      'Master vocabulary with adaptive questions and spaced repetition.',
  },
  match: {
    title: 'Match Game',
    description: 'Test your vocabulary recall speed with a matching challenge.',
  },
} satisfies Record<StudyRouteMode, Metadata>

export async function generateMetadata({
  params,
}: StudyModeRouteProps): Promise<Metadata> {
  const { mode } = await params
  if (!isStudyRouteMode(mode)) notFound()
  return studyMetadata[mode]
}

export default async function StudyModePage(props: StudyModeRouteProps) {
  const { mode } = await props.params
  if (!isStudyRouteMode(mode)) notFound()
  return StudyPage({ ...props, mode })
}
