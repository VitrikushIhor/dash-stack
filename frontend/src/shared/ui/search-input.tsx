import React from 'react'
import { Loader2, Search } from 'lucide-react'
import { cn } from '@/shared/lib'
import { Input } from '@/shared/ui/core/input'

export interface SearchInputProps extends React.ComponentProps<'input'> {
  isPending?: boolean
  wrapperClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, isPending, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', wrapperClassName)}>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input ref={ref} className={cn('px-9', className)} {...props} />
        {isPending && (
          <Loader2 className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin' />
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
