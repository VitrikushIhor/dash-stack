/// <reference lib="es2022.intl" />

import { extractDocumentText } from './extract-document-text';
import type { LearningDocument } from './learning-document.types';

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

export function countDocumentGraphemes(document: LearningDocument): number {
  const text = extractDocumentText(document);
  let count = 0;

  const segments = segmenter.segment(text)[Symbol.iterator]();
  while (!segments.next().done) {
    count += 1;
  }

  return count;
}
