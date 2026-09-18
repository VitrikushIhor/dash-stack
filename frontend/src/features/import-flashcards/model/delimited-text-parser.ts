import type { Delimiter, ParsedRow } from './delimited-text.types'

export type { Delimiter, ParsedRow } from './delimited-text.types'

export const parseDelimitedText = (
  input: string,
  delimiter: Delimiter
): ParsedRow[] => {
  const text = input.replace(/^\uFEFF/, '')
  const rows: ParsedRow[] = []
  let fields: string[] = []
  let field = ''
  let errors: string[] = []
  let state: 'plain' | 'quoted' | 'closed' = 'plain'
  let line = 1
  let sourceRow = 1

  const finishField = () => {
    fields.push(field)
    field = ''
    state = 'plain'
  }

  const finishRow = () => {
    finishField()
    if (fields.length > 1 || fields[0]?.trim() || errors.length) {
      rows.push({ sourceRow, fields, errors: [...new Set(errors)] })
    }
    fields = []
    errors = []
    sourceRow = line
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (state === 'quoted') {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else state = 'closed'
      } else {
        field += character
        if (
          character === '\n' ||
          (character === '\r' && text[index + 1] !== '\n')
        )
          line += 1
      }
      continue
    }

    if (character === delimiter) {
      finishField()
      continue
    }

    if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      line += 1
      finishRow()
      continue
    }

    if (character === '"' && state === 'plain' && field.length === 0) {
      state = 'quoted'
      continue
    }

    if (character === '"') errors.push('Quote inside an unquoted field')
    if (state === 'closed') errors.push('Unexpected text after a closing quote')
    field += character
  }

  if (state === 'quoted') errors.push('Unclosed quoted field')
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
