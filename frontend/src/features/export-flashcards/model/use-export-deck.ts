import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api/api-helpers'
import { downloadExport, requestDeckExport } from './export-deck'
import type { ExportFormat } from './export.types'

export const useExportDeck = (deckId: string) => {
  const [pending, setPending] = useState(false)

  const exportDeck = useCallback(
    async (format: ExportFormat) => {
      setPending(true)

      try {
        const { blob, filename } = await requestDeckExport(deckId, format)
        downloadExport(blob, filename)

        toast.success('Download started', {
          description: `Deck export: ${format.toUpperCase()}`,
        })
      } catch {
        handleServerError('Could not export this deck. Please try again.')
      } finally {
        setPending(false)
      }
    },
    [deckId]
  )

  return {
    exportDeck,
    pending,
  }
}
