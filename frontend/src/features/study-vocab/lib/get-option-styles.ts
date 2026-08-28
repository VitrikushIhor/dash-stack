export function getOptionStyles(
  optionId: string,
  correctCardId: string,
  selectedAnswer: string | null
): string {
  if (!selectedAnswer) {
    return 'border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-accent/40'
  }

  const isActuallyCorrect = optionId === correctCardId
  const isSelected = optionId === selectedAnswer

  if (isActuallyCorrect) {
    return 'border-green-600 bg-green-600 text-white hover:bg-green-600 shadow-sm'
  }

  if (isSelected) {
    return 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive shadow-sm'
  }

  return 'opacity-40 border-border bg-card text-muted-foreground'
}
