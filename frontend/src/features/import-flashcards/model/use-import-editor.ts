import { useCallback, useRef, useState } from 'react'
import {
  type ImportCard,
  type ImportOptions,
  type ImportPreview,
  contentWarnings,
  prepareImport,
  validateImportCard,
} from './import-preview'

export function useImportEditor() {
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const importId = useRef<string | null>(null)
  const previewInput = useRef<string | null>(null)

  const resetPreview = useCallback(() => {
    setPreview(null)
    setError(null)
    setAcknowledged(false)
  }, [])

  const createPreview = useCallback(
    (text: string, options: ImportOptions) => {
      resetPreview()
      try {
        const nextPreviewInput = JSON.stringify({ text, options })
        if (previewInput.current !== nextPreviewInput) {
          importId.current = crypto.randomUUID()
          previewInput.current = nextPreviewInput
        }
        setPreview(prepareImport(text, options))
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : 'Could not parse input'
        )
      }
    },
    [resetPreview]
  )

  const editRow = useCallback(
    (sourceRow: number, field: keyof ImportCard, value: string) => {
      setAcknowledged(false)
      setPreview((current) => {
        if (!current) return current

        return {
          ...current,
          rows: current.rows.map((row) => {
            if (row.sourceRow !== sourceRow) return row
            const card = { ...row.card, [field]: value }
            const syntaxErrors = row.errors.filter(
              (error) => error.kind === 'syntax'
            )

            return {
              ...row,
              card,
              errors: [...syntaxErrors, ...validateImportCard(card)],
              warnings: [
                ...row.warnings.filter((message) =>
                  message.startsWith('Unmapped')
                ),
                ...contentWarnings(card),
              ],
            }
          }),
        }
      })
    },
    []
  )

  const excludeRow = useCallback((sourceRow: number, excluded: boolean) => {
    setPreview((current) => {
      if (!current) return current

      return {
        ...current,
        rows: current.rows.map((row) =>
          row.sourceRow === sourceRow ? { ...row, excluded } : row
        ),
      }
    })
  }, [])

  const clearImportId = useCallback(() => {
    importId.current = null
    previewInput.current = null
  }, [])

  return {
    preview,
    error,
    setError,
    acknowledged,
    setAcknowledged,
    importId,
    resetPreview,
    createPreview,
    editRow,
    excludeRow,
    clearImportId,
  }
}
