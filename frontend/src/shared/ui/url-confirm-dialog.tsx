'use client'

import type { ReactNode } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './core/alert-dialog'
import { Button } from './core/button'

interface UrlConfirmDialogProps {
  queryKey: string
  title: ReactNode
  desc: ReactNode
  handleConfirm: () => void
  enabled?: boolean
  onClose?: () => void
  disabled?: boolean
  cancelBtnText?: string
  confirmText?: ReactNode
  destructive?: boolean
  isLoading?: boolean
  className?: string
  children?: ReactNode
}

export function UrlConfirmDialog({
  queryKey,
  title,
  desc,
  handleConfirm,
  enabled = true,
  onClose,
  disabled = false,
  cancelBtnText = 'Cancel',
  confirmText = 'Continue',
  destructive = false,
  isLoading = false,
  className,
  children,
}: UrlConfirmDialogProps) {
  const [value, setValue] = useQueryState(queryKey, parseAsString)

  const handleOpenChange = (open: boolean) => {
    if (open || isLoading) return

    void setValue(null)
    onClose?.()
  }

  return (
    <AlertDialog
      open={enabled && value !== null && value !== ''}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent className={className}>
        <AlertDialogHeader className='text-start'>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{desc}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText}
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
