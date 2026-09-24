import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ErrorState } from '@/shared/ui/error-state'

export default function VocabDeckNotFound() {
  return (
    <ErrorState
      statusCode='404'
      title='Vocabulary deck not found'
      description='This deck does not exist or is not available to you.'
    >
      <Button asChild>
        <Link href={ROUTES.vocabCatalog}>Browse vocabulary decks</Link>
      </Button>
    </ErrorState>
  )
}
