'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog } from '@/shared/ui/core/dialog'
import type { UnsplashPickerDialogProps } from '../model/unsplash-picker.types'
import { UnsplashPickerSkeleton } from './unsplash-picker-skeleton'

const UnsplashPickerContent = dynamic(
  () =>
    import('./unsplash-picker-content').then(
      (mod) => mod.UnsplashPickerContent
    ),
  { loading: UnsplashPickerSkeleton }
)

export function UnsplashPickerDialog(props: UnsplashPickerDialogProps) {
  const [hasOpened, setHasOpened] = useState(props.open)

  // Preserve the previous search when reopening a card with an empty term.
  if (props.open && !hasOpened) setHasOpened(true)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {hasOpened && <UnsplashPickerContent {...props} />}
    </Dialog>
  )
}
