import z from 'zod';
import { type LearningDocument } from '../../domain/documents/learning-document.types';
import { BadRequestException } from '@common/exceptions/domain.exception';
import { LEARNING_ERRORS } from '../../domain/constant/learning-errors';
import { DOCUMENT_LIMITS } from './learning-document-limits';

export const textNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string(),
  })
  .strict();

export const paragraphSchema = z
  .object({
    type: z.literal('paragraph'),
    content: z.array(textNodeSchema),
  })
  .strict();

export const learningDocumentSchema = z
  .object({
    schemaVersion: z.literal(1),
    type: z.literal('doc'),
    content: z.array(paragraphSchema),
  })
  .strict();

export function parseLearningDocument(input: unknown): LearningDocument {
  const parse = learningDocumentSchema.safeParse(input);

  if (!parse.success) throw new BadRequestException(LEARNING_ERRORS.INVALID_PARSE_DOCUMENT);

  let nodeCount = 1;
  for (const paragraph of parse.data.content) {
    nodeCount += 1 + paragraph.content.length;
    if (nodeCount > DOCUMENT_LIMITS.MAX_NODES) {
      throw new BadRequestException(LEARNING_ERRORS.DOCUMENT_NODE_LIMIT_EXCEEDED);
    }
  }

  const serializedBytes = Buffer.byteLength(JSON.stringify(parse.data), 'utf8');
  if (serializedBytes > DOCUMENT_LIMITS.MAX_SERIALIZED_SIZE_BYTES) {
    throw new BadRequestException(LEARNING_ERRORS.DOCUMENT_SIZE_LIMIT_EXCEEDED);
  }

  return {
    schemaVersion: parse.data.schemaVersion,
    type: parse.data.type,
    content: parse.data.content,
  };
}
