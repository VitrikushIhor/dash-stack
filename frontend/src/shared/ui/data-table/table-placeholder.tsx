import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface TablePlaceholderProps {
  icon: ReactNode
  label: string
  className?: string
}

export const TablePlaceholder = ({
  icon,
  label,
  className,
}: TablePlaceholderProps) => (
  <div className={cn('flex w-[100px] items-center gap-2', className)}>
    <span
      className='text-muted-foreground flex items-center gap-2 text-sm'
      tabIndex={0}
      aria-label={label}
      role='note'
    >
      {icon}
      <span>{label}</span>
    </span>
  </div>
)
