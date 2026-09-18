import type { Delimiter } from './delimited-text.types'

export const ImportSource = {
  GENERIC: 'generic',
  QUIZLET: 'quizlet',
  ANKI: 'anki',
  QUENTI: 'quenti',
  SPREADSHEET: 'spreadsheet',
  DASH_STACK_JSON: 'dash-stack-json',
} as const

export type ImportSource = (typeof ImportSource)[keyof typeof ImportSource]
export type ImportCard = { term: string; definition: string; example: string | null; imageUrl: string | null }
export type ImportError = { kind: 'syntax' | 'validation'; message: string }
export type ImportMapping = { term: number; definition: number; example: number | null; imageUrl: number | null }
export type ImportOptions = { source: ImportSource; delimiter: Delimiter | 'auto'; hasHeader: boolean; mapping: ImportMapping }
export type ImportPreviewRow = { sourceRow: number; card: ImportCard; errors: ImportError[]; warnings: string[]; excluded: boolean }
export type ImportPreview = { delimiter: Delimiter | null; rows: ImportPreviewRow[]; warnings: string[] }
