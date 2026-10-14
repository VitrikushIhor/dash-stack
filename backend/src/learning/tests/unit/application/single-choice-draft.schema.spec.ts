import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { parseSingleChoiceDraft } from '../../../application/validation/single-choice-draft.schema';
import { DOCUMENT_LIMITS } from '../../../application/validation/learning-document-limits';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import type { SingleChoiceDraftContent } from '../../../domain/questions/single-choice.types';

function document(text = ''): LearningDocument {
  return {
    schemaVersion: 1,
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

describe('parseSingleChoiceDraft', () => {
  const draft = {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    prompt: document('Choose'),
    options: [
      { optionId: 'a', label: document('will') },
      { optionId: 'b', label: document('is') },
    ],
    solution: { correctOptionId: 'a' },
    explanation: document(),
  } satisfies SingleChoiceDraftContent;

  it('should_return_the_draft_when_all_fields_are_valid', () => {
    expect(parseSingleChoiceDraft(draft)).toEqual(draft);
  });

  it.each([0, 1, 10])('should_accept_incomplete_drafts_when_option_count_is_%i', (count) => {
    const input = {
      ...draft,
      prompt: document(),
      options: Array.from({ length: count }, (_, index) => ({
        optionId: `option-${index}`,
        label: document(),
      })),
      solution: { correctOptionId: null },
    };

    expect(parseSingleChoiceDraft(input)).toEqual(input);
  });

  it('should_preserve_duplicate_labels_when_the_draft_is_not_ready_for_publication', () => {
    const input = {
      ...draft,
      options: draft.options.map((option) => ({ ...option, label: document('will') })),
    };

    expect(parseSingleChoiceDraft(input)).toEqual(input);
  });

  const invalidCases: ReadonlyArray<{ reason: string; input: unknown }> = [
    { reason: 'input_is_null', input: null },
    { reason: 'kind_is_wrong', input: { ...draft, kind: QUESTION_TYPE.TEXT } },
    { reason: 'question_id_is_empty', input: { ...draft, questionId: '' } },
    { reason: 'question_id_is_whitespace', input: { ...draft, questionId: '  ' } },
    {
      reason: 'option_id_is_empty',
      input: {
        ...draft,
        options: [{ optionId: '', label: document() }],
        solution: { correctOptionId: null },
      },
    },
    {
      reason: 'option_id_is_whitespace',
      input: {
        ...draft,
        options: [{ optionId: ' ', label: document() }],
        solution: { correctOptionId: null },
      },
    },
    {
      reason: 'option_ids_are_duplicated',
      input: { ...draft, options: [draft.options[0], draft.options[0]] },
    },
    {
      reason: 'there_are_too_many_options',
      input: {
        ...draft,
        options: Array.from({ length: 11 }, (_, index) => ({
          optionId: `${index}`,
          label: document(),
        })),
      },
    },
    {
      reason: 'key_references_an_unknown_option',
      input: { ...draft, solution: { correctOptionId: 'missing' } },
    },
    {
      reason: 'key_is_empty_instead_of_null',
      input: { ...draft, solution: { correctOptionId: '' } },
    },
    { reason: 'key_is_whitespace', input: { ...draft, solution: { correctOptionId: ' ' } } },
    { reason: 'key_is_missing', input: { ...draft, solution: {} } },
    { reason: 'root_has_extra_fields', input: { ...draft, ownerId: 'forged' } },
    {
      reason: 'option_has_extra_fields',
      input: { ...draft, options: [{ ...draft.options[0], isCorrect: true }] },
    },
    {
      reason: 'solution_has_extra_fields',
      input: { ...draft, solution: { correctOptionId: 'a', points: 100 } },
    },
  ];

  it.each(invalidCases)('should_reject_the_draft_when_$reason', ({ input }) => {
    expect(() => parseSingleChoiceDraft(input)).toThrow(BadRequestException);
  });

  it.each(['prompt', 'label', 'explanation'] as const)(
    'should_validate_document_structure_and_limits_for_%s',
    (field) => {
      for (const invalidDocument of [
        { ...document(), schemaVersion: 2 },
        document('a'.repeat(DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES)),
        {
          schemaVersion: 1,
          type: 'doc',
          content: Array.from({ length: DOCUMENT_LIMITS.MAX_NODES }, () => ({
            type: 'paragraph',
            content: [],
          })),
        },
      ]) {
        const input =
          field === 'label'
            ? { ...draft, options: [{ optionId: 'a', label: invalidDocument }] }
            : { ...draft, [field]: invalidDocument };

        expect(() => parseSingleChoiceDraft(input)).toThrow(BadRequestException);
      }
    },
  );

  it.each(['prompt', 'explanation'] as const)(
    'should_reject_the_draft_when_%s_is_missing',
    (field) => {
      const input = Object.fromEntries(Object.entries(draft).filter(([key]) => key !== field));

      expect(() => parseSingleChoiceDraft(input)).toThrow(BadRequestException);
    },
  );

  it('should_preserve_option_ids_when_they_contain_edge_spaces', () => {
    const input = {
      ...draft,
      options: [{ optionId: ' a ', label: document() }],
      solution: { correctOptionId: ' a ' },
    };

    expect(parseSingleChoiceDraft(input)).toEqual(input);
  });
});
