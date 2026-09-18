import type { Metadata } from 'next'
import { StudyMode } from '@/entities/vocab'
import { StudyPage, type StudyRouteProps } from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Learn Mode',
  description:
    'Master vocabulary with adaptive questions and spaced repetition.',
}

export default function LearnPage(props: StudyRouteProps) {
  return StudyPage({ ...props, mode: StudyMode.LEARN })
}
