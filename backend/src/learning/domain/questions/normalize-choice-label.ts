import { type LearningDocument } from '../documents/learning-document.types';
import { extractDocumentText } from '../documents/extract-document-text';

export function normalizeChoiceLabel(label: LearningDocument): string {
  return extractDocumentText(label).normalize('NFC').trim().replace(/ +/g, ' ');
}
