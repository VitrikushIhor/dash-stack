import { normalizeChoiceLabel } from '../../../domain/questions/normalize-choice-label';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';

describe('normalizeChoiceLabel', () => {
  const cases: ReadonlyArray<{ reason: string; text: string; expected: string }> = [
    { reason: 'edge_and_repeated_spaces_exist', text: '  will   go  ', expected: 'will go' },
    { reason: 'case_differs', text: 'Will go', expected: 'Will go' },
    { reason: 'punctuation_exists', text: 'will go!', expected: 'will go!' },
    { reason: 'accent_is_decomposed', text: 'cafe\u0301', expected: 'café' },
    { reason: 'accent_is_composed', text: 'café', expected: 'café' },
    { reason: 'internal_tabs_exist', text: 'will\t\tgo', expected: 'will\t\tgo' },
    { reason: 'internal_newlines_exist', text: 'will\n\ngo', expected: 'will\n\ngo' },
    {
      reason: 'internal_nonbreaking_spaces_exist',
      text: 'will\u00a0\u00a0go',
      expected: 'will\u00a0\u00a0go',
    },
    { reason: 'edge_whitespace_exists', text: '\t\n will go \u00a0', expected: 'will go' },
    { reason: 'text_is_whitespace_only', text: ' \t\n ', expected: '' },
    { reason: 'text_is_empty', text: '', expected: '' },
  ];

  it.each(cases)('should_normalize_the_label_when_$reason', ({ text, expected }) => {
    const label: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    };

    const result = normalizeChoiceLabel(label);

    expect(result).toBe(expected);
    expect(label.content[0].content[0].text).toBe(text);
  });

  it('should_normalize_combined_text_when_an_accent_is_split_across_nodes', () => {
    const label: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: ' e' },
            { type: 'text', text: '\u0301 ' },
          ],
        },
      ],
    };

    expect(normalizeChoiceLabel(label)).toBe('é');
  });

  it('should_preserve_paragraph_separators_when_the_label_contains_multiple_paragraphs', () => {
    const label: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: ['will', 'go'].map((text) => ({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })),
    };

    expect(normalizeChoiceLabel(label)).toBe('will\ngo');
  });
});
