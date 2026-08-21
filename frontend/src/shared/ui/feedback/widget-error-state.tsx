import { AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'

export interface WidgetErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function WidgetErrorState({
  title = 'Failed to load content',
  description = 'An error occurred while fetching the data. Please try again.',
  onRetry,
  className,
}: WidgetErrorStateProps) {
  return (
    <div
      role='alert'
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center',
        className
      )}
    >
      <div className='bg-destructive/10 text-destructive mb-3 flex h-10 w-10 items-center justify-center rounded-full'>
        <AlertCircle className='h-5 w-5' />
      </div>
      <h3 className='text-foreground text-base font-semibold tracking-tight'>
        {title}
      </h3>
      <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
        {description}
      </p>
      {onRetry && (
        <Button
          variant='outline'
          size='sm'
          onClick={onRetry}
          className='border-destructive/20 hover:bg-destructive/10 mt-4 gap-2'
        >
          <RotateCcw className='h-3.5 w-3.5' />
          Retry
        </Button>
      )}
    </div>
  )
}
