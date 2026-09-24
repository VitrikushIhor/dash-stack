import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json',
} as const

export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat]

const fallbackFilename = (format: ExportFormat): string => {
  return `vocabulary-deck.${format}`
}

const getFilename = (
  contentDisposition: string | null,
  format: ExportFormat
): string => {
  const filenameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '')

  return filenameMatch?.[1] ?? fallbackFilename(format)
}

export const useExportDeck = (deckId: string) => {
  const [pending, setPending] = useState(false)

  const exportDeck = useCallback(
    async (format: ExportFormat) => {
      setPending(true)

      try {
        const response = await fetch(
          `/api/proxy/v1/vocab/decks/${encodeURIComponent(deckId)}/export?format=${format}`
        )

        if (!response.ok) {
          throw new Error('Unable to export this deck')
        }

        const url = URL.createObjectURL(await response.blob())
        const link = document.createElement('a')

        link.href = url
        link.download = getFilename(
          response.headers.get('Content-Disposition'),
          format
        )
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)

        toast.success('Download started', {
          description: `Deck export: ${format.toUpperCase()}`,
        })
      } catch {
        toast.error('Could not export this deck. Please try again.')
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
