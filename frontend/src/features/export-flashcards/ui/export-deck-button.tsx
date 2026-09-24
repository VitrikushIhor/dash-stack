'use client'

import { Download } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { useExportDeck } from '../model/use-export-deck'

interface ExportDeckButtonProps {
  deckId: string
}

export const ExportDeckButton = ({ deckId }: ExportDeckButtonProps) => {
  const { exportDeck, pending } = useExportDeck(deckId)
  const handleExportCsv = () => void exportDeck('csv')
  const handleExportJson = () => void exportDeck('json')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          disabled={pending}
          className='gap-1.5'
        >
          <Download className='h-3.5 w-3.5' />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleExportCsv}>
          CSV (Spreadsheet)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJson}>
          JSON (Data)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
