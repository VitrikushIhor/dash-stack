'use client'

import type { ComponentProps } from 'react'
import dynamic from 'next/dynamic'
import { type MatchCard } from '@/entities/vocab'
import { MatchPlayer, StudySessionSkeleton } from '@/features/study-vocab'

export const DynamicMatchPlayer = dynamic(() => Promise.resolve(MatchPlayer), {
  ssr: false,
  loading: () => <StudySessionSkeleton />,
})

export type DynamicMatchPlayerProps = ComponentProps<
  typeof DynamicMatchPlayer
> & { cards: MatchCard[] }
