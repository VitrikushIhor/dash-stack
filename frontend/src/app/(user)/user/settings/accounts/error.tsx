'use client'

import { WidgetErrorState } from '@/shared/ui/feedback'

export default function AccountsError({ reset }: { reset: () => void }) {
  return (
    <WidgetErrorState
      title='Could not load connected accounts'
      description='Please try again.'
      onRetry={reset}
    />
  )
}
