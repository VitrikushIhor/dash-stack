type DeckCardPreviewHeaderProps = {
  cardCount: number
  currentIndex: number
  hasCard: boolean
}

export const DeckCardPreviewHeader = ({
  cardCount,
  currentIndex,
  hasCard,
}: DeckCardPreviewHeaderProps) => {
  return (
    <div className='mb-4 flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium'>Card preview</p>
        <p className='text-muted-foreground text-xs'>
          Previewing does not change your progress
        </p>
      </div>

      <span className='text-muted-foreground text-sm'>
        {hasCard ? currentIndex + 1 : 0} / {cardCount}
      </span>
    </div>
  )
}
