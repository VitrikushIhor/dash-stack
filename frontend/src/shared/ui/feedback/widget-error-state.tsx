import { AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'

export interface WidgetErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  size?: 'default' | 'compact'
}

export function WidgetErrorState({
  title = 'Failed to load content',
  description = 'An error occurred while fetching the data. Please try again.',
  onRetry,
  className,
  size = 'default',
}: WidgetErrorStateProps) {
  return (
    <div
      role='alert'
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center',
        size === 'compact' &&
          'min-h-0 flex-row justify-start gap-3 p-3 text-start',
        className
      )}
    >
      <div
        className={cn(
          'bg-destructive/10 text-destructive mb-3 flex h-10 w-10 items-center justify-center rounded-full',
          size === 'compact' && 'mb-0 h-8 w-8 shrink-0'
        )}
      >
        <AlertCircle className={cn(size === 'compact' && 'h-4 w-4')} />
      </div>
      <div className={cn(size === 'compact' && 'min-w-0 flex-1')}>
        <h3
          className={cn(
            'text-foreground text-base font-semibold tracking-tight',
            size === 'compact' && 'text-sm'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-muted-foreground mt-1 max-w-sm text-sm',
            size === 'compact' && 'mt-0 text-xs'
          )}
        >
          {description}
        </p>
      </div>
      {onRetry && (
        <Button
          variant='outline'
          size='sm'
          onClick={onRetry}
          className={cn(
            'border-destructive/20 hover:bg-destructive/10 mt-4 gap-2',
            size === 'compact' && 'mt-0 shrink-0'
          )}
        >
          <RotateCcw className='h-3.5 w-3.5' />
          Retry
        </Button>
      )}
    </div>
  )
}
