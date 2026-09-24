import type { ImportCard } from './import-preview'

export type ImportDialogProps = {
  onConfirm: (importId: string, cards: ImportCard[]) => Promise<boolean>
}
