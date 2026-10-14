import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { LEARNING_ERRORS } from '../../../domain/constant/learning-errors';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import type {
  SingleChoiceDraftContent,
  SingleChoiceOption,
} from '../../../domain/questions/single-choice.types';
import { validateSingleChoicePublication } from '../../../domain/questions/validate-single-choice-publication';

function document(text: string): LearningDocument {
  return {
    schemaVersion: 1,
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

function options(count: number): SingleChoiceOption[] {
  return Array.from({ length: count }, (_, index) => ({
    optionId: `option-${index}`,
    label: document(`Answer ${index}`),
  }));
}

function draft(overrides: Partial<SingleChoiceDraftContent> = {}): SingleChoiceDraftContent {
  return {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    prompt: document('Choose the future form.'),
    options: options(2),
    solution: { correctOptionId: 'option-0' },
    explanation: document(''),
    ...overrides,
  };
}

describe('validateSingleChoicePublication', () => {
  const fieldLimits = [
    { field: 'prompt', limit: 10_000, message: 'Question prompt exceeds the visible text limit' },
    { field: 'label', limit: 1_000, message: 'Choice option label exceeds the visible text limit' },
    {
      field: 'explanation',
      limit: 10_000,
      message: 'Question explanation exceeds the visible text limit',
    },
  ] as const;

  function draftWithText(
    field: 'prompt' | 'label' | 'explanation',
    text: string,
  ): SingleChoiceDraftContent {
    if (field === 'label') {
      return draft({ options: [{ optionId: 'option-0', label: document(text) }, options(2)[1]] });
    }
    return draft({ [field]: document(text) });
  }

  it.each(fieldLimits)(
    'should_accept_publication_when_$field_is_at_the_grapheme_limit',
    ({ field, limit }) => {
      const question = draftWithText(field, 'a'.repeat(limit));

      expect(() => validateSingleChoicePublication(question)).not.toThrow();
    },
  );

  it.each(fieldLimits)(
    'should_reject_publication_when_$field_exceeds_the_grapheme_limit',
    ({ field, limit, message }) => {
      const question = draftWithText(field, 'a'.repeat(limit + 1));

      expect(() => validateSingleChoicePublication(question)).toThrow(BadRequestException);
      expect(() => validateSingleChoicePublication(question)).toThrow(message);
    },
  );

  it.each(fieldLimits)(
    'should_count_joined_emoji_as_one_grapheme_when_checking_$field',
    ({ field, limit, message }) => {
      const valid = draftWithText(field, '👩‍💻'.repeat(limit));
      const invalid = draftWithText(field, '👩‍💻'.repeat(limit + 1));

      expect(() => validateSingleChoicePublication(valid)).not.toThrow();
      expect(() => validateSingleChoicePublication(invalid)).toThrow(message);
    },
  );

  it('should_count_original_spaces_when_the_label_normalizes_to_short_text', () => {
    const question = draftWithText('label', ` ${'a'}${' '.repeat(999)}`);

    expect(() => validateSingleChoicePublication(question)).toThrow(
      'Choice option label exceeds the visible text limit',
    );
  });

  it.each([2, 10])('should_accept_publication_when_there_are_%i_valid_options', (count) => {
    const question = draft({ options: options(count) });

    expect(() => validateSingleChoicePublication(question)).not.toThrow();
  });

  it('should_accept_publication_when_the_explanation_is_empty', () => {
    const question = draft({ explanation: { schemaVersion: 1, type: 'doc', content: [] } });

    expect(() => validateSingleChoicePublication(question)).not.toThrow();
  });

  it.each([0, 1, 11])('should_reject_publication_when_option_count_is_%i', (count) => {
    const question = draft({ options: options(count) });

    expect(() => validateSingleChoicePublication(question)).toThrow(BadRequestException);
    expect(() => validateSingleChoicePublication(question)).toThrow(
      LEARNING_ERRORS.OPTIONS_MUST_BE_BETWEEN_2_AND_10,
    );
  });

  const invalidCases: ReadonlyArray<{
    reason: string;
    question: SingleChoiceDraftContent;
    message: string;
  }> = [
    {
      reason: 'prompt_is_empty',
      question: draft({ prompt: document('') }),
      message: LEARNING_ERRORS.PROMPT_CANNOT_BE_EMPTY,
    },
    {
      reason: 'prompt_is_whitespace',
      question: draft({ prompt: document(' \t\n ') }),
      message: LEARNING_ERRORS.PROMPT_CANNOT_BE_EMPTY,
    },
    {
      reason: 'label_is_empty',
      question: draft({ options: [{ optionId: 'option-0', label: document('') }, options(2)[1]] }),
      message: LEARNING_ERRORS.OPTION_LABEL_CANNOT_BE_EMPTY,
    },
    {
      reason: 'label_is_whitespace',
      question: draft({
        options: [{ optionId: 'option-0', label: document(' \t ') }, options(2)[1]],
      }),
      message: LEARNING_ERRORS.OPTION_LABEL_CANNOT_BE_EMPTY,
    },
    {
      reason: 'option_id_is_empty',
      question: draft({ options: [options(2)[0], { optionId: '', label: document('Other') }] }),
      message: LEARNING_ERRORS.OPTION_ID_CANNOT_BE_EMPTY,
    },
    {
      reason: 'option_id_is_whitespace',
      question: draft({ options: [options(2)[0], { optionId: '   ', label: document('Other') }] }),
      message: LEARNING_ERRORS.OPTION_ID_CANNOT_BE_EMPTY,
    },
    {
      reason: 'option_ids_are_duplicated',
      question: draft({
        options: [options(2)[0], { optionId: 'option-0', label: document('Other') }],
      }),
      message: LEARNING_ERRORS.OPTION_IDS_MUST_BE_UNIQUE,
    },
    {
      reason: 'labels_are_identical',
      question: draft({
        options: [
          { optionId: 'option-0', label: document('will') },
          { optionId: 'option-1', label: document('will') },
        ],
      }),
      message: LEARNING_ERRORS.OPTION_LABELS_MUST_BE_UNIQUE,
    },
    {
      reason: 'labels_differ_only_in_edge_whitespace',
      question: draft({
        options: [
          { optionId: 'option-0', label: document('will') },
          { optionId: 'option-1', label: document('  will  ') },
        ],
      }),
      message: LEARNING_ERRORS.OPTION_LABELS_MUST_BE_UNIQUE,
    },
    {
      reason: 'labels_differ_only_in_repeated_spaces',
      question: draft({
        options: [
          { optionId: 'option-0', label: document('will go') },
          { optionId: 'option-1', label: document('will  go') },
        ],
      }),
      message: LEARNING_ERRORS.OPTION_LABELS_MUST_BE_UNIQUE,
    },
    {
      reason: 'labels_are_canonically_equivalent',
      question: draft({
        options: [
          { optionId: 'option-0', label: document('café') },
          { optionId: 'option-1', label: document('cafe\u0301') },
        ],
      }),
      message: LEARNING_ERRORS.OPTION_LABELS_MUST_BE_UNIQUE,
    },
    {
      reason: 'correct_option_is_null',
      question: draft({ solution: { correctOptionId: null } }),
      message: LEARNING_ERRORS.CORRECT_OPTION_ID_IS_REQUIRED,
    },
    {
      reason: 'correct_option_is_empty',
      question: draft({ solution: { correctOptionId: '' } }),
      message: LEARNING_ERRORS.CORRECT_OPTION_ID_IS_REQUIRED,
    },
    {
      reason: 'correct_option_is_not_in_options',
      question: draft({ solution: { correctOptionId: 'missing-option' } }),
      message: LEARNING_ERRORS.CORRECT_OPTION_ID_MUST_BE_ONE_OF_THE_OPTIONS,
    },
  ];

  it.each(invalidCases)('should_reject_publication_when_$reason', ({ question, message }) => {
    const validate = () => validateSingleChoicePublication(question);

    expect(validate).toThrow(BadRequestException);
    expect(validate).toThrow(message);
  });

  it.each([
    ['will', 'Will'],
    ['will', 'will!'],
    ['will go', 'will\tgo'],
  ])('should_accept_distinct_labels_when_they_are_%s_and_%s', (first, second) => {
    const question = draft({
      options: [
        { optionId: 'option-0', label: document(first) },
        { optionId: 'option-1', label: document(second) },
      ],
    });

    expect(() => validateSingleChoicePublication(question)).not.toThrow();
  });

  it('should_accept_publication_when_the_last_option_is_correct', () => {
    const question = draft({ solution: { correctOptionId: 'option-1' } });

    expect(() => validateSingleChoicePublication(question)).not.toThrow();
  });
});
