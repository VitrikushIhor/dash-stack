import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ErrorStateProps {
  statusCode: string
  title: string
  description: ReactNode
  className?: string
  children?: ReactNode
}

export function ErrorState({
  statusCode,
  title,
  description,
  className,
  children,
}: ErrorStateProps) {
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 p-4'>
        <h1 className='text-[7rem] leading-tight font-bold'>{statusCode}</h1>
        <span className='text-xl font-medium'>{title}</span>
        <p className='text-muted-foreground max-w-md text-center'>
          {description}
        </p>
        {children && <div className='mt-6 flex gap-4'>{children}</div>}
      </div>
    </div>
  )
}
