import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type ImportOptions } from './import-preview'
import { useImportEditor } from './use-import-editor'

const options: ImportOptions = {
  source: 'generic',
  delimiter: ',',
  hasHeader: false,
  mapping: { term: 0, definition: 1, example: null, imageUrl: null },
}

describe('useImportEditor', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should_reuse_the_import_id_for_the_same_preview_and_replace_it_for_new_input', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('import-1')
      .mockReturnValueOnce('import-2')
    const { result } = renderHook(() => useImportEditor())

    act(() => result.current.createPreview('term,definition', options))
    const firstImportId = result.current.importId.current

    act(() => result.current.createPreview('term,definition', options))
    act(() => result.current.createPreview('next,definition', options))

    expect(firstImportId).toBe('import-1')
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2)
    expect(result.current.importId.current).toBe('import-2')
  })
})
