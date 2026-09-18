import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { ExportFormat, useExportDeck } from './use-export-deck'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useExportDeck', () => {
  const createObjectUrl = vi.fn(() => 'blob:deck-export')
  const revokeObjectUrl = vi.fn()
  const downloadClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName)
      if (tagName === 'a') vi.spyOn(element, 'click').mockImplementation(downloadClick)
      return element
    })
  })

  it('downloads an owner export without navigating to the proxy URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('export data', {
        headers: {
          'Content-Disposition': 'attachment; filename="my-deck.json"',
        },
      })
    )
    const { result } = renderHook(() => useExportDeck('deck id'))

    await act(async () => {
      await result.current.exportDeck(ExportFormat.JSON)
    })

    await waitFor(() => expect(downloadClick).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith(
      '/api/proxy/v1/vocab/decks/deck%20id/export?format=json'
    )
    expect(createObjectUrl).toHaveBeenCalledOnce()
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:deck-export')
    expect(toast.success).toHaveBeenCalledWith('Download started', {
      description: 'Deck export: JSON',
    })
  })

  it('shows an error when the export request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }))
    const { result } = renderHook(() => useExportDeck('deck-id'))

    await act(async () => {
      await result.current.exportDeck(ExportFormat.CSV)
    })

    expect(downloadClick).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Could not export this deck. Please try again.')
  })
})
