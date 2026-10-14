import { extractDocumentText } from '../../../domain/documents/extract-document-text';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';

describe('extractDocumentText', () => {
  const cases: ReadonlyArray<{
    reason: string;
    paragraphs: readonly (readonly string[])[];
    expected: string;
  }> = [
    { reason: 'document_is_empty', paragraphs: [], expected: '' },
    { reason: 'paragraph_is_empty', paragraphs: [[]], expected: '' },
    { reason: 'adjacent_paragraphs_are_empty', paragraphs: [[], []], expected: '\n' },
    {
      reason: 'text_is_split_across_nodes',
      paragraphs: [['Hello ', 'world'], ['Next line']],
      expected: 'Hello world\nNext line',
    },
    {
      reason: 'text_contains_edge_and_internal_whitespace',
      paragraphs: [['  Hello ', ' world  '], [' Next ']],
      expected: '  Hello  world  \n Next ',
    },
    {
      reason: 'empty_paragraphs_surround_and_separate_text',
      paragraphs: [[], ['First'], [], ['Last'], []],
      expected: '\nFirst\n\nLast\n',
    },
    {
      reason: 'text_contains_unicode_and_newlines',
      paragraphs: [['Привіт ', '👩‍💻', ' e\u0301\nкінець']],
      expected: 'Привіт 👩‍💻 e\u0301\nкінець',
    },
  ];

  it.each(cases)('should_preserve_rendered_text_when_$reason', ({ paragraphs, expected }) => {
    const document: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: paragraphs.map((texts) => ({
        type: 'paragraph',
        content: texts.map((text) => ({ type: 'text', text })),
      })),
    };

    const result = extractDocumentText(document);

    expect(result).toBe(expected);
  });
});
