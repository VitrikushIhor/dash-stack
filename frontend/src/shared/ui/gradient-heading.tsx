import React from 'react'
import { cn } from '@/shared/lib'

export const GradientHeading = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'from-primary/10 via-primary/5 relative overflow-hidden bg-linear-to-r',
        className
      )}
      {...props}
    >
      <div className='relative z-10'>{children}</div>
      <div className='from-primary/10 absolute inset-0 bg-linear-to-b to-transparent opacity-50' />
    </div>
  )
}
