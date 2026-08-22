import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'

interface CatalogPaginationProps {
  currentPage: number
  totalPages: number
  totalResults: number
  isPending: boolean
  onPageChange: (page: number) => void
}

export function CatalogPagination({
  currentPage,
  totalPages,
  totalResults,
  isPending,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className='border-border/40 text-muted-foreground mt-6 flex items-center justify-between border-t pt-4 text-xs'>
      <span>
        Showing Page {currentPage} of {totalPages} ({totalResults} total decks)
      </span>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isPending}
          className='h-8 gap-1 text-xs'
        >
          <ChevronLeft className='h-3.5 w-3.5' />
          <span>Previous</span>
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || isPending}
          className='h-8 gap-1 text-xs'
        >
          <span>Next</span>
          <ChevronRight className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  )
}
