import { PaginationControls } from '@/shared/ui/pagination-controls'

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

      <PaginationControls
        canPreviousPage={currentPage > 1}
        canNextPage={currentPage < totalPages}
        isPending={isPending}
        onPreviousPage={() => onPageChange(Math.max(1, currentPage - 1))}
        onNextPage={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      />
    </div>
  )
}
