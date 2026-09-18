import { shuffle } from '@/shared/lib/utils'
import { type LearnChoice } from '../session/adaptive-session.contract'
import { normalizeLearnAnswer } from './answer-evaluation'

export function createLearnChoices(
  card: LearnChoice,
  pool: readonly LearnChoice[]
): LearnChoice[] | null {
  const correct = normalizeLearnAnswer(card.definition)

  if (pool.length < 4 || !correct) return null

  const definitions = new Set([correct])
  const distractors = pool.filter((candidate) => {
    const definition = normalizeLearnAnswer(candidate.definition)

    if (
      candidate.id === card.id ||
      !definition ||
      definitions.has(definition)
    ) {
      return false
    }
    definitions.add(definition)

    return true
  })

  if (distractors.length < 3) return null

  return shuffle([card, ...shuffle(distractors).slice(0, 3)]).map(
    ({ id, definition }) => ({ id, definition })
  )
}
