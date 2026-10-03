import { type ImportSource, ImportSource as Source } from './import.types'

export function getImportSourceDelimiter(source: ImportSource): '\t' | 'auto' {
  return source === Source.QUIZLET || source === Source.QUENTI ? '\t' : 'auto'
}
