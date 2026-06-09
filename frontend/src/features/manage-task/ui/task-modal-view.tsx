import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'

type TaskModalViewProps = {
  title: string
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TaskModalView = ({
  title,
  children,
  open,
  onOpenChange,
}: TaskModalViewProps) => {
  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open)}>
      <DialogContent
        className='max-h-[90vh] max-w-3xl'
        aria-describedby={title}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[calc(90vh-120px)] pr-4'>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
