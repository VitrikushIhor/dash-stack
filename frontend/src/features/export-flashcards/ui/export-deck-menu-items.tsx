'use client'

import { Download } from 'lucide-react'
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { ExportFormat } from '../model/export.types'
import { useExportDeck } from '../model/use-export-deck'

interface ExportDeckMenuItemsProps {
  deckId: string
}

export function ExportDeckMenuItems({ deckId }: ExportDeckMenuItemsProps) {
  const { exportDeck, pending } = useExportDeck(deckId)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className='flex items-center gap-2'
        disabled={pending}
      >
        <Download className='h-4 w-4' />
        <span>Export</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => void exportDeck(ExportFormat.CSV)}>
            CSV (Spreadsheet)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void exportDeck(ExportFormat.JSON)}>
            JSON (Data)
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
