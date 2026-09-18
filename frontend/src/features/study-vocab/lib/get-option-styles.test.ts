import { describe, expect, it } from 'vitest'
import { getOptionStyles } from './get-option-styles'

describe('getOptionStyles', () => {
  it('returns default unselected styles when selectedAnswer is null', () => {
    const styles = getOptionStyles('opt-1', 'opt-1', null)

    expect(styles).toContain('border-border bg-card')
    expect(styles).toContain('hover:border-primary/40')
  })

  it('returns success styles for the correct option when an answer is selected', () => {
    const styles = getOptionStyles('correct-id', 'correct-id', 'wrong-id')

    expect(styles).toContain('bg-green-600')
    expect(styles).toContain('text-white')
  })

  it('returns destructive error styles for the selected incorrect option', () => {
    const styles = getOptionStyles('wrong-id', 'correct-id', 'wrong-id')

    expect(styles).toContain('bg-destructive')
    expect(styles).toContain('text-destructive-foreground')
  })

  it('returns faded muted styles for non-selected distractors when an answer is chosen', () => {
    const styles = getOptionStyles('distractor-id', 'correct-id', 'wrong-id')

    expect(styles).toContain('opacity-40')
    expect(styles).toContain('text-muted-foreground')
  })
})
