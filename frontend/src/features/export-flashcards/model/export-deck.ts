import type { ExportFormat } from './export.types'

const FALLBACK_FILENAME = 'vocabulary-deck'

export function getExportFilename(
  contentDisposition: string | null,
  format: ExportFormat
): string {
  const encodedFilename = /filename\*=UTF-8''([^;]+)/i.exec(
    contentDisposition ?? ''
  )?.[1]

  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename)
    } catch {
      // Fall through to the standard filename parameter when encoding is invalid.
    }
  }

  const filename = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '')?.[1]

  return filename ?? `${FALLBACK_FILENAME}.${format}`
}

export async function requestDeckExport(
  deckId: string,
  format: ExportFormat
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(
    `/api/proxy/v1/vocab/decks/${encodeURIComponent(deckId)}/export?format=${format}`
  )

  if (!response.ok) throw new Error('Unable to export this deck')

  return {
    blob: await response.blob(),
    filename: getExportFilename(
      response.headers.get('Content-Disposition'),
      format
    ),
  }
}

export function downloadExport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
