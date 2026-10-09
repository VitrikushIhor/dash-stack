'use client'

import type { ComponentProps, ReactNode } from 'react'
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

interface UrlConfirmDialogRootProps {
  queryKey: string
  handleConfirm: () => void
  enabled?: boolean
  onClose?: () => void
  disabled?: boolean
  cancelBtnText?: string
  confirmText?: ReactNode
  destructive?: boolean
  isLoading?: boolean
  className?: string
  children: ReactNode
}

function Root({
  queryKey,
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
}: UrlConfirmDialogRootProps) {
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

function Header(props: ComponentProps<typeof AlertDialogHeader>) {
  return <AlertDialogHeader className='text-start' {...props} />
}

function Title(props: ComponentProps<typeof AlertDialogTitle>) {
  return <AlertDialogTitle {...props} />
}

function Description({
  children,
  ...props
}: Omit<ComponentProps<typeof AlertDialogDescription>, 'asChild'>) {
  return (
    <AlertDialogDescription asChild {...props}>
      <div>{children}</div>
    </AlertDialogDescription>
  )
}

function Body({ className, ...props }: ComponentProps<'div'>) {
  return <div className={className} {...props} />
}

function ErrorMessage({ className, ...props }: ComponentProps<'output'>) {
  return (
    <output
      role='alert'
      className={className ?? 'text-destructive text-sm'}
      {...props}
    />
  )
}

export const UrlConfirmDialog = {
  Root,
  Header,
  Title,
  Description,
  Body,
  ErrorMessage,
}
