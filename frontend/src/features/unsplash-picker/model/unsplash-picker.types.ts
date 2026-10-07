export interface UnsplashPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
  onSelectImage: (imageUrl: string) => void
}
