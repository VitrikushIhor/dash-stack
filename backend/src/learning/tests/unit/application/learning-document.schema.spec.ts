import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { parseLearningDocument } from '../../../application/validation/learning-document.schema';
import { LEARNING_ERRORS } from '../../../domain/constant/learning-errors';
import type { LearningDocument } from '../../../domain/documents/learning-document.types';
import { DOCUMENT_LIMITS } from '../../../application/validation/learning-document-limits';

function documentWithText(text: string): LearningDocument {
  return {
    schemaVersion: 1,
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

describe('parseLearningDocument', () => {
  it('should_accept_the_document_when_total_nodes_equal_the_limit', () => {
    const input: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: Array.from({ length: DOCUMENT_LIMITS.MAX_NODES - 2 }, () => ({
            type: 'text' as const,
            text: '',
          })),
        },
      ],
    };

    expect(parseLearningDocument(input)).toEqual(input);
  });

  it('should_reject_the_document_when_text_nodes_exceed_the_total_limit', () => {
    const input: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: Array.from({ length: DOCUMENT_LIMITS.MAX_NODES - 1 }, () => ({
            type: 'text' as const,
            text: '',
          })),
        },
      ],
    };

    expect(() => parseLearningDocument(input)).toThrow(BadRequestException);
    expect(() => parseLearningDocument(input)).toThrow('Learning document has too many nodes');
  });

  it('should_count_root_and_empty_paragraphs_when_checking_total_nodes', () => {
    const input: LearningDocument = {
      schemaVersion: 1,
      type: 'doc',
      content: Array.from({ length: DOCUMENT_LIMITS.MAX_NODES - 1 }, () => ({
        type: 'paragraph' as const,
        content: [],
      })),
    };

    expect(parseLearningDocument(input)).toEqual(input);
    expect(() =>
      parseLearningDocument({
        ...input,
        content: [...input.content, { type: 'paragraph', content: [] }],
      }),
    ).toThrow('Learning document has too many nodes');
  });

  it('should_accept_the_document_when_serialized_bytes_equal_the_limit', () => {
    const overhead = Buffer.byteLength(JSON.stringify(documentWithText('')), 'utf8');
    const input = documentWithText(
      'a'.repeat(DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES - overhead),
    );

    expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBe(
      DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES,
    );
    expect(parseLearningDocument(input)).toEqual(input);
  });

  it('should_reject_the_document_when_serialized_size_exceeds_the_limit_by_one_byte', () => {
    const overhead = Buffer.byteLength(JSON.stringify(documentWithText('')), 'utf8');
    const input = documentWithText(
      'a'.repeat(DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES - overhead + 1),
    );

    expect(() => parseLearningDocument(input)).toThrow(BadRequestException);
    expect(() => parseLearningDocument(input)).toThrow(
      'Learning document exceeds the serialized size limit',
    );
  });

  it.each(['ї', '😀', '"'])(
    'should_measure_utf8_and_json_escaping_when_text_contains_%s',
    (character) => {
      const input = documentWithText(
        character.repeat(Math.floor(DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES / 2)),
      );

      expect(input.content[0].content[0].text.length).toBeLessThanOrEqual(
        DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES,
      );
      expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBeGreaterThan(
        DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES,
      );
      expect(() => parseLearningDocument(input)).toThrow(
        'Learning document exceeds the serialized size limit',
      );
    },
  );

  const document = {
    schemaVersion: 1,
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world' },
        ],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Другий абзац' }] },
    ],
  } satisfies LearningDocument;

  it('should_preserve_the_document_when_multiple_paragraphs_and_text_nodes_are_valid', () => {
    const result = parseLearningDocument(document);

    expect(result).toEqual(document);
  });

  it('should_accept_the_draft_when_the_document_is_empty', () => {
    const draft = { schemaVersion: 1, type: 'doc', content: [] };

    const result = parseLearningDocument(draft);

    expect(result).toEqual(draft);
  });

  it('should_accept_the_draft_when_a_paragraph_is_empty', () => {
    const draft = {
      schemaVersion: 1,
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    };

    const result = parseLearningDocument(draft);

    expect(result).toEqual(draft);
  });

  it('should_accept_the_draft_when_a_text_node_is_empty', () => {
    const draft = {
      schemaVersion: 1,
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
    };

    const result = parseLearningDocument(draft);

    expect(result).toEqual(draft);
  });

  const invalidDocuments: ReadonlyArray<{ reason: string; payload: unknown }> = [
    { reason: 'version_is_a_string', payload: { ...document, schemaVersion: '1' } },
    { reason: 'version_is_unsupported', payload: { ...document, schemaVersion: 2 } },
    { reason: 'root_type_is_invalid', payload: { ...document, type: 'paragraph' } },
    { reason: 'root_has_an_unknown_field', payload: { ...document, solution: 'hidden' } },
    { reason: 'root_content_is_not_an_array', payload: { ...document, content: {} } },
    {
      reason: 'paragraph_type_is_invalid',
      payload: { ...document, content: [{ type: 'heading', content: [] }] },
    },
    {
      reason: 'paragraph_has_an_unknown_field',
      payload: { ...document, content: [{ type: 'paragraph', content: [], solution: 'hidden' }] },
    },
    {
      reason: 'paragraph_contains_a_string_instead_of_a_node',
      payload: { ...document, content: [{ type: 'paragraph', content: ['Hello'] }] },
    },
    {
      reason: 'text_node_type_is_invalid',
      payload: {
        ...document,
        content: [{ type: 'paragraph', content: [{ type: 'html', text: 'Hello' }] }],
      },
    },
    {
      reason: 'text_node_has_an_unknown_field',
      payload: {
        ...document,
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Hello', isCorrect: true }] },
        ],
      },
    },
    {
      reason: 'text_is_missing',
      payload: { ...document, content: [{ type: 'paragraph', content: [{ type: 'text' }] }] },
    },
    {
      reason: 'text_is_not_a_string',
      payload: {
        ...document,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 42 }] }],
      },
    },
    { reason: 'document_is_null', payload: null },
    { reason: 'document_is_undefined', payload: undefined },
  ];

  it.each(invalidDocuments)('should_reject_the_document_when_$reason', ({ payload }) => {
    const parse = () => parseLearningDocument(payload);

    expect(parse).toThrow(BadRequestException);
    expect(parse).toThrow(LEARNING_ERRORS.INVALID_PARSE_DOCUMENT);
  });
});
