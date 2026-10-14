import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { publishSingleChoiceContent } from '../../../domain/questions/publish-single-choice-content';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import type { SingleChoiceDraftContent } from '../../../domain/questions/single-choice.types';

function document(text: string) {
  return {
    schemaVersion: 1 as const,
    type: 'doc' as const,
    content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text }] }],
  };
}

function draft() {
  return {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    prompt: document('Choose the future form.'),
    options: [
      { optionId: 'a', label: document('will') },
      { optionId: 'b', label: document('is') },
    ],
    solution: { correctOptionId: 'a' },
    explanation: document('Use will for predictions.'),
  } satisfies SingleChoiceDraftContent;
}

describe('publishSingleChoiceContent', () => {
  it('should_return_published_content_when_the_draft_is_valid', () => {
    const input = draft();

    const result = publishSingleChoiceContent(input);

    expect(result).toEqual(input);
  });

  it('should_reject_publication_when_the_correct_option_is_not_selected', () => {
    const input = { ...draft(), solution: { correctOptionId: null } };

    expect(() => publishSingleChoiceContent(input)).toThrow(BadRequestException);
  });

  it('should_reject_publication_when_the_prompt_is_empty', () => {
    const input = { ...draft(), prompt: document('') };

    expect(() => publishSingleChoiceContent(input)).toThrow(BadRequestException);
  });

  it('should_reject_publication_when_option_labels_are_duplicates', () => {
    const input = draft();
    input.options[1].label = document('  will  ');

    expect(() => publishSingleChoiceContent(input)).toThrow(BadRequestException);
  });

  it('should_preserve_the_published_snapshot_when_nested_draft_content_changes', () => {
    const input = draft();
    const expected = structuredClone(input);

    const published = publishSingleChoiceContent(input);
    input.prompt.content[0].content[0].text = 'Edited prompt';
    input.options[0].label.content[0].content[0].text = 'Edited option';
    input.options[0].optionId = 'changed-id';
    input.options.reverse();
    input.solution.correctOptionId = 'b';
    input.explanation.content[0].content[0].text = 'Edited explanation';

    expect(published).toEqual(expected);
  });
});
