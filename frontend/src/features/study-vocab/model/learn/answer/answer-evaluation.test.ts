import { describe, expect, it } from 'vitest'
import { evaluateLearnAnswer } from './answer-evaluation'

describe('evaluateLearnAnswer', () => {
  it.each([
    ['apple', 'apple', 'exact'],
    ['  APPLE  ', 'apple', 'normalized'],
    ['ice   cream', 'ice cream', 'normalized'],
    ['aple', 'apple', 'incorrect'],
    ['apl', 'apple', 'incorrect'],
    ['wri', 'write', 'incorrect'],
    ['thought', 'thought, thought', 'normalized'],
    ['written', 'write (wrote, written)', 'normalized'],
    ['ap', 'apple', 'incorrect'],
    ['banana', 'apple', 'incorrect'],
    ['', 'a', 'incorrect'],
    ['  ', 'a', 'incorrect'],
    ['buy', 'buy (bought, bought)', 'normalized'],
  ])('should_return_%s_against_%s_as_%s', (answer, expected, kind) => {
    expect(evaluateLearnAnswer(answer, expected)).toEqual({
      kind,
      isCorrect: kind !== 'incorrect',
    })
  })
})
