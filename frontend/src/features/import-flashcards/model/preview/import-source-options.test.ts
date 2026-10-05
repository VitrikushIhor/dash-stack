import { describe, expect, it } from 'vitest'
import { getImportSourceDelimiter } from './import-source-options'
import { ImportSource } from './import.types'

describe('getImportSourceDelimiter', () => {
  it.each([ImportSource.QUIZLET, ImportSource.QUENTI])(
    'should_use_tab_when_source_is_%s',
    (source) => {
      expect(getImportSourceDelimiter(source)).toBe('\t')
    }
  )

  it.each([
    ImportSource.GENERIC,
    ImportSource.ANKI,
    ImportSource.SPREADSHEET,
    ImportSource.DASH_STACK_JSON,
  ])('should_detect_delimiter_when_source_is_%s', (source) => {
    expect(getImportSourceDelimiter(source)).toBe('auto')
  })
})
