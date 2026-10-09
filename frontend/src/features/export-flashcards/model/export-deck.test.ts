import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  downloadExport,
  getExportFilename,
  requestDeckExport,
} from './export-deck'
import { ExportFormat } from './export.types'

describe('getExportFilename', () => {
  it('uses the UTF-8 filename parameter when provided', () => {
    expect(
      getExportFilename(
        "attachment; filename=deck.csv; filename*=UTF-8''caf%C3%A9.json",
        ExportFormat.JSON
      )
    ).toBe('café.json')
  })

  it('uses the regular filename parameter or a format fallback', () => {
    expect(
      getExportFilename('attachment; filename="my-deck.csv"', ExportFormat.CSV)
    ).toBe('my-deck.csv')
    expect(getExportFilename(null, ExportFormat.JSON)).toBe(
      'vocabulary-deck.json'
    )
  })
})

describe('requestDeckExport', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))

  it('requests the selected format and returns its blob and filename', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('export data', {
        headers: { 'Content-Disposition': 'attachment; filename=deck.csv' },
      })
    )

    const result = await requestDeckExport('deck id', ExportFormat.CSV)

    expect(fetch).toHaveBeenCalledWith(
      '/api/proxy/v1/vocab/decks/deck%20id/export?format=csv'
    )
    expect(result.filename).toBe('deck.csv')
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('rejects unsuccessful responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }))

    await expect(
      requestDeckExport('deck-id', ExportFormat.JSON)
    ).rejects.toThrow('Unable to export this deck')
  })
})

describe('downloadExport', () => {
  it('creates and clicks a temporary download link', () => {
    const click = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:deck-export')
    const revokeObjectURL = vi.fn()
    const setTimeoutSpy = vi
      .spyOn(window, 'setTimeout')
      .mockImplementation((callback) => {
        callback()
        return {} as ReturnType<typeof window.setTimeout>
      })
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = document.createElementNS(
          'http://www.w3.org/1999/xhtml',
          tagName
        )
        if (tagName === 'a')
          vi.spyOn(element, 'click').mockImplementation(click)
        return element
      }
    )

    downloadExport(new Blob(['data']), 'deck.json')

    expect(click).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:deck-export')
    expect(setTimeoutSpy).toHaveBeenCalledOnce()
  })
})
