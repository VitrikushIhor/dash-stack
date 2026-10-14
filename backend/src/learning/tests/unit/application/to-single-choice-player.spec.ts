import { toSingleChoicePlayer } from '../../../application/projections/to-single-choice-player';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import type { PublishedSingleChoiceContent } from '../../../domain/questions/single-choice.types';

function textDocument(text: string): LearningDocument {
  return {
    schemaVersion: 1,
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

describe('toSingleChoicePlayer', () => {
  const question = {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    prompt: textDocument('I think she ___ win.'),
    options: [
      { optionId: 'option-a', label: textDocument('will') },
      { optionId: 'option-b', label: textDocument('is') },
    ],
    solution: { correctOptionId: 'option-a' },
    explanation: textDocument('Use will for predictions.'),
  } satisfies PublishedSingleChoiceContent;

  it('should_return_only_visible_fields_when_the_question_contains_a_solution_and_explanation', () => {
    const result = toSingleChoicePlayer(question);

    expect(result).toEqual({
      questionId: 'question-1',
      kind: QUESTION_TYPE.SINGLE_CHOICE,
      prompt: textDocument('I think she ___ win.'),
      options: [
        { optionId: 'option-a', label: textDocument('will') },
        { optionId: 'option-b', label: textDocument('is') },
      ],
    });
  });

  it('should_exclude_extra_fields_when_runtime_question_and_options_contain_private_metadata', () => {
    const questionWithMetadata = {
      ...question,
      authorNotes: 'Private author note',
      options: [
        { ...question.options[0], isCorrect: true, feedback: 'Private feedback' },
        { ...question.options[1], isCorrect: false },
      ],
    };

    const result = toSingleChoicePlayer(questionWithMetadata);

    expect(result).toEqual({
      questionId: question.questionId,
      kind: question.kind,
      prompt: question.prompt,
      options: [
        { optionId: 'option-a', label: textDocument('will') },
        { optionId: 'option-b', label: textDocument('is') },
      ],
    });
  });

  it('should_preserve_author_order_when_options_are_reordered', () => {
    const reordered = { ...question, options: [question.options[1], question.options[0]] };

    const result = toSingleChoicePlayer(reordered);

    expect(result.options.map((option) => option.optionId)).toEqual(['option-b', 'option-a']);
  });
});
