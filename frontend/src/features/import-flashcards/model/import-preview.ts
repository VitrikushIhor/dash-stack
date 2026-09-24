import { FlashcardSchema } from '@/entities/deck'
import { DashStackJsonBackupSchema } from './dash-stack-json-backup.schema'
import {
  type Delimiter,
  detectDelimiter,
  parseDelimitedText,
} from './delimited-text-parser'
import { IMPORT_MAX_BYTES, IMPORT_MAX_ROWS } from './import.constants'
import {
  type ImportCard,
  type ImportError,
  ImportErrorKind,
  type ImportOptions,
  type ImportPreview,
  type ImportPreviewRow,
  ImportSource,
} from './import.types'

export { IMPORT_MAX_BYTES } from './import.constants'
export { ImportSource } from './import.types'
export type {
  ImportCard,
  ImportMapping,
  ImportOptions,
  ImportPreview,
} from './import.types'

export const validateImportCard = (card: ImportCard): ImportError[] => {
  const parsed = FlashcardSchema.safeParse({
    ...card,
    example: card.example ?? undefined,
    imageUrl: card.imageUrl ?? undefined,
  })
  const errors = parsed.success
    ? []
    : parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      )

  if (!card.term.trim()) errors.push('Term must contain text')
  if (!card.definition.trim()) errors.push('Definition must contain text')
  if (
    card.imageUrl &&
    (card.imageUrl.length > 2048 || !/^https?:\/\//i.test(card.imageUrl))
  )
    errors.push('Image URL must be HTTP(S) and at most 2048 characters')

  return errors.map((message) => ({
    kind: ImportErrorKind.VALIDATION,
    message,
  }))
}

export const contentWarnings = (card: ImportCard): string[] => {
  const text = [card.term, card.definition, card.example].join('\n')

  return /<\/?[a-z][^>]*>|&(?:[a-z]+|#\d+);|\{\{c\d+::|\[sound:/i.test(text)
    ? [
        'HTML, cloze or media content is imported as literal text; formatting and media are unsupported.',
      ]
    : []
}

export const prepareImport = (
  input: string,
  options: ImportOptions
): ImportPreview => {
  if (new TextEncoder().encode(input).byteLength > IMPORT_MAX_BYTES)
    throw new Error('Input exceeds 4 MiB')

  if (options.source === ImportSource.DASH_STACK_JSON) {
    return prepareDashStackJsonImport(input)
  }

  const ankiDirectives = readAnkiDirectives(input, options.source)
  const { text, offset, declared, warnings } = ankiDirectives
  const delimiter =
    options.delimiter === 'auto'
      ? (declared ?? detectDelimiter(text))
      : options.delimiter

  if (!delimiter)
    return {
      delimiter,
      rows: [],
      warnings: [
        ...warnings,
        'Select a separator: detection is ambiguous or no delimited rows were found.',
      ],
    }
  const parsed = parseDelimitedText(text, delimiter)
  const data = options.hasHeader ? parsed.slice(1) : parsed

  if (data.length > IMPORT_MAX_ROWS) throw new Error('Import exceeds 2000 rows')
  const mapping = options.mapping
  const selected = Object.values(mapping).filter(
    (value): value is number => value !== null
  )

  if (new Set(selected).size !== selected.length)
    throw new Error('Map each field to a different column')
  const rows = data.map((row): ImportPreviewRow => {
    const value = (column: number | null) =>
      column === null ? null : (row.fields[column] ?? '')
    const card: ImportCard = {
      term: value(mapping.term) ?? '',
      definition: value(mapping.definition) ?? '',
      example: value(mapping.example),
      imageUrl: value(mapping.imageUrl),
    }
    const unmapped = row.fields.flatMap((field, index) =>
      !selected.includes(index) && field !== '' ? [index + 1] : []
    )

    return {
      sourceRow: row.sourceRow + offset,
      card,
      excluded: false,
      errors: [
        ...row.errors.map((message): ImportError => ({
          kind: ImportErrorKind.SYNTAX,
          message,
        })),
        ...validateImportCard(card),
      ],
      warnings: [
        ...contentWarnings(card),
        ...(unmapped.length
          ? [`Unmapped non-empty columns: ${unmapped.join(', ')}`]
          : []),
      ],
    }
  })

  return { delimiter, rows, warnings }
}

function readAnkiDirectives(input: string, source: ImportSource) {
  let text = input.replace(/^\uFEFF/, '')
  let offset = 0
  let declared: Delimiter | null = null
  const warnings: string[] = []

  if (source !== ImportSource.ANKI) return { text, offset, declared, warnings }

  let header = readAnkiDirective(text)
  while (header) {
    const directive = header[0].trimEnd()
    const separator = /^#separator:(.*)$/i
      .exec(directive)?.[1]
      ?.trim()
      .toLowerCase()

    if (separator) {
      const delimiter = getAnkiDelimiter(separator)

      if (delimiter) declared = delimiter
      else
        warnings.push(
          `Unsupported Anki separator: ${separator}. Choose a supported separator manually.`
        )
    } else
      warnings.push(
        `Anki directive retained here for review, not imported as a card: ${directive}`
      )

    text = text.slice(header[0].length)
    offset += 1
    header = readAnkiDirective(text)
  }

  return { text, offset, declared, warnings }
}

function getAnkiDelimiter(separator: string): Delimiter | null {
  const delimiters: Record<string, Delimiter> = {
    tab: '\t',
    comma: ',',
    semicolon: ';',
  }

  return delimiters[separator] ?? null
}

function readAnkiDirective(text: string): RegExpExecArray | null {
  const header = /^#[^\r\n]*(?:\r\n|\r|\n|$)/.exec(text)

  if (!header) return null

  return /^#(?:separator|html|columns|tags):/i.test(header[0]) ? header : null
}

const prepareDashStackJsonImport = (input: string): ImportPreview => {
  let raw: unknown

  try {
    raw = JSON.parse(input.replace(/^\uFEFF/, ''))
  } catch {
    throw new Error('Dash Stack JSON must be valid JSON')
  }

  const parsed = DashStackJsonBackupSchema.safeParse(raw)

  if (!parsed.success) {
    throw new Error(
      'Dash Stack JSON must use schemaVersion 1 with a cards array'
    )
  }
  if (parsed.data.cards.length > IMPORT_MAX_ROWS) {
    throw new Error('Import exceeds 2000 rows')
  }

  return {
    delimiter: null,
    warnings: [],
    rows: parsed.data.cards.map((card, index) => ({
      sourceRow: index + 1,
      card,
      excluded: false,
      errors: validateImportCard(card),
      warnings: contentWarnings(card),
    })),
  }
}
