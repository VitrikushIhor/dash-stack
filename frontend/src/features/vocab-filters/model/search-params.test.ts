import { describe, expect, it } from 'vitest'
import { vocabCatalogSearchParams } from './search-params'

describe('vocabCatalogSearchParams', () => {
  it('parses supported CEFR levels and ignores unknown values', () => {
    expect(vocabCatalogSearchParams.level.parseServerSide('B2')).toBe('B2')
    expect(vocabCatalogSearchParams.level.parseServerSide('expert')).toBeNull()
  })
})
