import { cn } from '@/shared/lib'

type DeckCardFaceProps = {
  children: React.ReactNode
  label: string
  isHidden: boolean
  isBack?: boolean
}

export const DeckCardFace = ({
  children,
  label,
  isHidden,
  isBack = false,
}: DeckCardFaceProps) => {
  return (
    <span
      aria-hidden={isHidden}
      className={cn(
        'bg-muted/40 absolute inset-0 flex flex-col items-center justify-center rounded-xl border p-8 backface-hidden',
        isBack && 'transform-[rotateY(180deg)]'
      )}
    >
      <span className='text-muted-foreground absolute top-5 left-5 text-xs font-medium tracking-wider uppercase'>
        {label}
      </span>

      {children}

      <span className='text-muted-foreground absolute bottom-5 text-xs'>
        Click to flip
      </span>
    </span>
  )
}
