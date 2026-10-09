import React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className='bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full'>
          <Icon className='h-7 w-7' />
        </div>
      )}
      <h3 className='mt-4 text-lg font-bold'>{title}</h3>
      {description && (
        <p className='text-muted-foreground mt-1 max-w-sm text-xs'>
          {description}
        </p>
      )}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}
