import type { Metadata } from 'next'
import { StudyMode } from '@/entities/vocab'
import { StudyPage, type StudyRouteProps } from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Flashcards',
  description: 'Study vocabulary flashcards with spaced repetition.',
}

export default function FlashcardsPage(props: StudyRouteProps) {
  return StudyPage({ ...props, mode: StudyMode.FLASHCARDS })
}
