import type { Delimiter, ParsedRow } from './delimited-text.types'

export type { Delimiter } from './delimited-text.types'

interface ParserState {
  field: string
  state: 'plain' | 'quoted' | 'closed'
  line: number
  errors: string[]
}

function consumeQuotedCharacter(
  parser: ParserState,
  character: string,
  nextCharacter: string | undefined
): number {
  if (character === '"') {
    if (nextCharacter === '"') {
      parser.field += '"'
      return 1
    }
    parser.state = 'closed'
    return 0
  }

  parser.field += character
  if (character === '\n' || (character === '\r' && nextCharacter !== '\n')) {
    parser.line += 1
  }
  return 0
}

function consumePlainCharacter(parser: ParserState, character: string): void {
  if (
    character === '"' &&
    parser.state === 'plain' &&
    parser.field.length === 0
  ) {
    parser.state = 'quoted'
    return
  }

  if (character === '"') parser.errors.push('Quote inside an unquoted field')
  if (parser.state === 'closed')
    parser.errors.push('Unexpected text after a closing quote')
  parser.field += character
}

export const parseDelimitedText = (
  input: string,
  delimiter: Delimiter
): ParsedRow[] => {
  const text = input.replace(/^\uFEFF/, '')
  const rows: ParsedRow[] = []
  let fields: string[] = []
  const parser: ParserState = { field: '', errors: [], state: 'plain', line: 1 }
  let sourceRow = 1

  const finishField = () => {
    fields.push(parser.field)
    parser.field = ''
    parser.state = 'plain'
  }

  const finishRow = () => {
    finishField()
    if (fields.length > 1 || fields[0]?.trim() || parser.errors.length) {
      rows.push({ sourceRow, fields, errors: [...new Set(parser.errors)] })
    }
    fields = []
    parser.errors = []
    sourceRow = parser.line
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (parser.state === 'quoted') {
      index += consumeQuotedCharacter(parser, character, text[index + 1])
      continue
    }

    if (character === delimiter) {
      finishField()
      continue
    }

    if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      parser.line += 1
      finishRow()
      continue
    }

    consumePlainCharacter(parser, character)
  }

  if (parser.state === 'quoted') parser.errors.push('Unclosed quoted field')
  finishRow()

  return rows
}

export const detectDelimiter = (input: string): Delimiter | null => {
  const candidates: Delimiter[] = ['\t', ',', ';']
  const matches = candidates.filter((delimiter) => {
    const rows = parseDelimitedText(input, delimiter)
    const width = rows[0]?.fields.length ?? 0

    return (
      width > 1 &&
      rows.every(
        (row) => row.fields.length === width && row.errors.length === 0
      )
    )
  })

  return matches.length === 1 ? matches[0]! : null
}
