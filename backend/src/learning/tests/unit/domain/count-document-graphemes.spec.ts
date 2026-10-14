import { countDocumentGraphemes } from '../../../domain/documents/count-document-graphemes';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';

describe('countDocumentGraphemes', () => {
  const cases: ReadonlyArray<{
    reason: string;
    paragraphs: readonly (readonly string[])[];
    expected: number;
  }> = [
    { reason: 'document_is_empty', paragraphs: [], expected: 0 },
    { reason: 'text_is_ascii', paragraphs: [['hello']], expected: 5 },
    { reason: 'accent_is_composed', paragraphs: [['é']], expected: 1 },
    { reason: 'accent_is_decomposed', paragraphs: [['e\u0301']], expected: 1 },
    { reason: 'accent_is_split_across_nodes', paragraphs: [['e', '\u0301']], expected: 1 },
    { reason: 'emoji_has_joined_components', paragraphs: [['👩‍💻']], expected: 1 },
    { reason: 'emoji_is_split_across_nodes', paragraphs: [['👩', '\u200d', '💻']], expected: 1 },
    { reason: 'emoji_has_a_skin_tone', paragraphs: [['👍🏽']], expected: 1 },
    { reason: 'emoji_is_a_flag', paragraphs: [['🇺🇦']], expected: 1 },
    { reason: 'text_contains_spaces', paragraphs: [['a b']], expected: 3 },
    { reason: 'text_contains_a_newline', paragraphs: [['a\nb']], expected: 3 },
    { reason: 'paragraphs_add_a_separator', paragraphs: [['a'], ['b']], expected: 3 },
    { reason: 'paragraphs_are_empty', paragraphs: [[], []], expected: 1 },
    { reason: 'text_contains_edge_spaces', paragraphs: [[' a ']], expected: 3 },
  ];

  it.each(cases)('should_count_visible_characters_when_$reason', ({ paragraphs, expected }) => {
    const document: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: paragraphs.map((texts) => ({
        type: 'paragraph',
        content: texts.map((text) => ({ type: 'text', text })),
      })),
    };

    const result = countDocumentGraphemes(document);

    expect(result).toBe(expected);
  });
});
