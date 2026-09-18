import type { Metadata } from 'next'
import { StudyMode } from '@/entities/vocab'
import { StudyPage, type StudyRouteProps } from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Match Game',
  description: 'Test your vocabulary recall speed with a matching challenge.',
}

export default function MatchPage(props: StudyRouteProps) {
  return StudyPage({ ...props, mode: StudyMode.MATCH })
}
