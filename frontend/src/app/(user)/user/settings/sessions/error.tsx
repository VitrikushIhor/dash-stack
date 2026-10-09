'use client'

import { WidgetErrorState } from '@/shared/ui/feedback'

export default function SessionsError({ reset }: { reset: () => void }) {
  return (
    <WidgetErrorState
      title='Could not load active sessions'
      description='Please try again. Your sessions have not been changed.'
      onRetry={reset}
    />
  )
}
