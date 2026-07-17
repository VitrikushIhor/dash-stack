// src/shared/ui/components/ui/label-badge.tsx
import { memo } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { type Label, labelColorStyles } from './types.label'

interface LabelBadgeProps {
  label: Label
  onRemove?: (labelId: string) => void
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export const LabelBadge = memo(function LabelBadge({
  label,
  onRemove,
  size = 'sm',
  className,
}: LabelBadgeProps) {
  const colorStyle = labelColorStyles[label.color]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
        colorStyle.bg,
        colorStyle.text,
        colorStyle.border,
        sizeClasses[size],
        onRemove && 'pr-1',
        className
      )}
    >
      {label.name}
      {onRemove && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onRemove(label.id)
          }}
          className={cn(
            'rounded-sm transition-colors hover:bg-black/10',
            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
          )}
          aria-label={`Видалити ${label.name}`}
        >
          <X className='h-full w-full' />
        </button>
      )}
    </span>
  )
})
