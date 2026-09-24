import type { Metadata } from 'next'
import { DeckBoardPage } from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Vocabulary deck',
  description: 'Preview a vocabulary deck and choose how to study it.',
}

export default DeckBoardPage
