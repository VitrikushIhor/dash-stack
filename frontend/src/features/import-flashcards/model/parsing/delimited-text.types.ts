export type Delimiter = '\t' | ',' | ';'

export type ParsedRow = {
  sourceRow: number
  fields: string[]
  errors: string[]
}
