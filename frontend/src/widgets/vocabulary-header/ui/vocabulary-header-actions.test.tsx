import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { VocabularyHeaderActions } from './vocabulary-header-actions'

describe('VocabularyHeaderActions', () => {
  it('should_render_a_stable_fallback_on_the_server', () => {
    const markup = renderToString(
      <VocabularyHeaderActions fallback={<span>Header controls</span>}>
        <button>Radix control</button>
      </VocabularyHeaderActions>
    )

    expect(markup).toContain('Header controls')
    expect(markup).not.toContain('Radix control')
  })
})
