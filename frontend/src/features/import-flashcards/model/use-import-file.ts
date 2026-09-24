import { useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { IMPORT_MAX_BYTES } from './import-preview'
import type { ImportFormValues } from './use-import-form'

interface UseImportFileProps {
  form: UseFormReturn<ImportFormValues>
  resetPreview: () => void
  setError: (error: string | null) => void
}

export function useImportFile({
  form,
  resetPreview,
  setError,
}: UseImportFileProps) {
  const [reading, setReading] = useState(false)
  const fileVersion = useRef(0)

  const readFile = async (file: File) => {
    const version = ++fileVersion.current

    resetPreview()
    setReading(true)
    try {
      if (!/\.(csv|tsv|txt|json)$/i.test(file.name)) {
        throw new Error('Choose a .csv, .tsv, .txt or .json file')
      }

      if (file.size > IMPORT_MAX_BYTES) {
        throw new Error('Input exceeds 4 MiB')
      }

      const value = new TextDecoder('utf-8', { fatal: true }).decode(
        await file.arrayBuffer()
      )

      if (version === fileVersion.current) {
        form.setValue('text', value)
        if (/\.json$/i.test(file.name)) {
          form.setValue('source', 'dash-stack-json')
        }
      }
    } catch (cause: unknown) {
      if (version === fileVersion.current) {
        form.setValue('text', '')
        setError(cause instanceof Error ? cause.message : 'Could not read file')
      }
    } finally {
      if (version === fileVersion.current) {
        setReading(false)
      }
    }
  }

  const cancelReading = () => {
    fileVersion.current += 1
    setReading(false)
  }

  return { reading, readFile, cancelReading }
}
