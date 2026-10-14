import type { LearningDocument } from './learning-document.types';

export function extractDocumentText(document: LearningDocument): string {
  return document.content
    .map((paragraph) => paragraph.content.map((node) => node.text).join(''))
    .join('\n');
}
