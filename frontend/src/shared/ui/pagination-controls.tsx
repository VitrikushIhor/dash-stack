import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './core/button'

interface PaginationActionsProps {
  mode?: 'actions'
  canPreviousPage: boolean
  canNextPage: boolean
  isPending: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

interface PaginationLinksProps {
  mode: 'links'
  previousHref: string | null
  nextHref: string | null
}

type PaginationControlsProps = PaginationActionsProps | PaginationLinksProps

export function PaginationControls(props: PaginationControlsProps) {
  if (props.mode === 'links') {
    return (
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='h-8 gap-1 text-xs'
          asChild={props.previousHref !== null}
          disabled={props.previousHref === null}
        >
          {props.previousHref ? (
            <Link href={props.previousHref}>
              <ChevronLeft className='h-3.5 w-3.5' />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className='h-3.5 w-3.5' />
              Previous
            </>
          )}
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-8 gap-1 text-xs'
          asChild={props.nextHref !== null}
          disabled={props.nextHref === null}
        >
          {props.nextHref ? (
            <Link href={props.nextHref}>
              Next
              <ChevronRight className='h-3.5 w-3.5' />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className='h-3.5 w-3.5' />
            </>
          )}
        </Button>
      </div>
    )
  }

  const {
    canPreviousPage,
    canNextPage,
    isPending,
    onPreviousPage,
    onNextPage,
  } = props

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={onPreviousPage}
        disabled={!canPreviousPage || isPending}
        className='h-8 gap-1 text-xs'
      >
        <ChevronLeft className='h-3.5 w-3.5' />
        <span>Previous</span>
      </Button>

      <Button
        variant='outline'
        size='sm'
        onClick={onNextPage}
        disabled={!canNextPage || isPending}
        className='h-8 gap-1 text-xs'
      >
        <span>Next</span>
        <ChevronRight className='h-3.5 w-3.5' />
      </Button>
    </div>
  )
}
