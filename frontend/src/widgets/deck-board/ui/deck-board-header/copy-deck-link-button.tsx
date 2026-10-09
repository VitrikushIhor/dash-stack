'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'

type CopyDeckLinkButtonProps = {
  deckId: string
}

export const CopyDeckLinkButton = ({ deckId }: CopyDeckLinkButtonProps) => {
  const handleCopy = async () => {
    try {
      const url = new URL(ROUTES.vocabDeck(deckId), window.location.origin)

      await navigator.clipboard.writeText(url.toString())

      toast.success('Deck link copied')
    } catch {
      toast.error('Could not copy the deck link')
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleCopy}
      aria-label='Copy deck link'
      className='gap-1.5'
    >
      <Copy className='h-3.5 w-3.5' />
      <span>Share</span>
    </Button>
  )
}
