import type { ImportCard } from '../preview/import.types'

export type ImportDialogProps = {
  onConfirm: (importId: string, cards: ImportCard[]) => Promise<boolean>
}
