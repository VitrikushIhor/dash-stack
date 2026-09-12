import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/core/button'
import { Input } from '@/shared/ui/core/input'
import { type AdaptiveLearnQuestionProps } from '../../../model/learn/adaptive-player.contract'
import { useMultipleChoiceShortcuts } from '../../../model/learn/interaction/use-multiple-choice-shortcuts'
import {
  LearnPhase,
  LearnStage,
} from '../../../model/learn/session/adaptive-session.constants'

export function AdaptiveLearnQuestion({
  card,
  choices,
  phase,
  stage,
  isSyncing,
  feedback,
  onSelectChoice,
  onSubmitTyping,
}: AdaptiveLearnQuestionProps) {
  const [input, setInput] = useState('')
  const isQuestion = phase === LearnPhase.Question

  useMultipleChoiceShortcuts({
    optionsCount: choices.length,
    isDisabled: !isQuestion || isSyncing,
    onSelectIndex: (index) => {
      const choice = choices[index]
      if (choice) onSelectChoice(choice.id)
    },
  })

  const submitTyping = (event: FormEvent) => {
    event.preventDefault()
    if (input.trim()) onSubmitTyping(input)
  }

  return (
    <>
      <div className='bg-card border-border mb-6 rounded-xl border p-8 text-center shadow-sm'>
        {stage === LearnStage.Mcq ? (
          <>
            <p className='text-muted-foreground mb-2 text-sm'>
              Choose the definition
            </p>
            <h2 className='text-3xl font-bold'>{card.term}</h2>
          </>
        ) : (
          <>
            <p className='text-muted-foreground mb-2 text-sm'>Type the term</p>
            <h2 className='text-2xl font-semibold'>{card.definition}</h2>
          </>
        )}
      </div>

      {stage === LearnStage.Mcq ? (
        <div className='grid gap-3 sm:grid-cols-2'>
          {choices.map((choice, index) => (
            <Button
              key={choice.id}
              variant='outline'
              className={`h-auto min-h-16 justify-start p-4 text-left whitespace-normal ${
                feedback && choice.id === card.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15'
                  : feedback?.kind === 'incorrect' &&
                      choice.definition === feedback.answer
                    ? 'border-red-500 bg-red-500/10 text-red-700 hover:bg-red-500/15'
                    : ''
              }`}
              disabled={!isQuestion}
              onClick={() => onSelectChoice(choice.id)}
            >
              <span className='mr-2 text-xs'>{index + 1}</span>
              {choice.definition}
            </Button>
          ))}
        </div>
      ) : (
        <form onSubmit={submitTyping} className='flex gap-3'>
          <Input
            aria-label='Type the term'
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={!isQuestion}
          />
          <Button type='submit' disabled={!input.trim() || !isQuestion}>
            Check
          </Button>
        </form>
      )}
    </>
  )
}
