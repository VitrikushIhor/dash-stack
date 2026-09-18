'use client'

import { useCallback, useState, useTransition } from 'react'
import type { ImportDialogProps } from './import-dialog.types'
import { IMPORT_MAX_BYTES, type ImportOptions } from './import-preview'
import { useImportSearchParams } from './import-search-params'
import { useImportEditor } from './use-import-editor'
import { useImportFile } from './use-import-file'
import { importFormDefaults, useImportForm } from './use-import-form'

export function useImportPreview({ onConfirm }: ImportDialogProps) {
  const [searchParams, setSearchParams] = useImportSearchParams()
  const open = searchParams['import-cards']

  const { form, text, options } = useImportForm()

  const {
    preview,
    error,
    setError,
    acknowledged,
    setAcknowledged,
    importId,
    resetPreview,
    createPreview: createPreviewBase,
    editRow,
    excludeRow,
    clearImportId,
  } = useImportEditor()

  const { reading, readFile, cancelReading } = useImportFile({
    form,
    resetPreview,
    setError,
  })

  const [isPending, startTransition] = useTransition()
  const [hasUnresolvedConfirmation, setHasUnresolvedConfirmation] =
    useState(false)

  const changeText = useCallback(
    (value: string) => {
      if (hasUnresolvedConfirmation) return
      cancelReading()
      form.setValue('text', value)
      resetPreview()
    },
    [form, resetPreview, cancelReading, hasUnresolvedConfirmation]
  )

  const changeOptions = useCallback(
    (value: ImportOptions) => {
      if (hasUnresolvedConfirmation) return
      form.setValue('source', value.source)
      form.setValue('delimiter', value.delimiter)
      form.setValue('hasHeader', value.hasHeader)
      form.setValue('mapping', value.mapping)
      resetPreview()
    },
    [form, resetPreview, hasUnresolvedConfirmation]
  )

  const createPreview = useCallback(() => {
    if (hasUnresolvedConfirmation) return
    createPreviewBase(text, options)
  }, [createPreviewBase, hasUnresolvedConfirmation, text, options])

  const included = preview?.rows.filter((row) => !row.excluded) ?? []
  const hasWarnings =
    !!preview?.warnings.length || included.some((row) => row.warnings.length)

  const canConfirm =
    included.length > 0 &&
    included.every((row) => row.errors.length === 0) &&
    (!hasWarnings || acknowledged) &&
    !isPending &&
    !reading

  const confirm = () => {
    if (!canConfirm || isPending) return

    if (!importId.current) {
      setError('Preview an import before confirming it')

      return
    }

    const previewImportId = importId.current
    const confirmedCards = included.map((row) => row.card)
    if (
      new TextEncoder().encode(
        JSON.stringify({ deckId: 'deck', importId: previewImportId, cards: confirmedCards })
      ).byteLength > IMPORT_MAX_BYTES
    ) {
      setError('Import payload exceeds 4 MiB')
      
      return
    }

    startTransition(async () => {
      setError(null)

      try {
        const success = await onConfirm(previewImportId, confirmedCards)

        if (success) {
          setHasUnresolvedConfirmation(false)
          await setSearchParams({ 'import-cards': false })
          form.reset(importFormDefaults)
          resetPreview()
          clearImportId()
        } else {
          setHasUnresolvedConfirmation(true)
          setError(
            'Import was not confirmed. Keep this preview and retry only with the same import request.'
          )
        }
      } catch (cause: unknown) {
        setHasUnresolvedConfirmation(true)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Import could not be confirmed'
        )
      }
    })
  }

  const changeOpen = useCallback(
    (value: boolean) => {
      if (isPending) return
      cancelReading()
      void setSearchParams({ 'import-cards': value })
      if (!value) {
        if (hasUnresolvedConfirmation) return
        resetPreview()
        form.reset(importFormDefaults)
        clearImportId()
      }
    },
    [
      cancelReading,
      setSearchParams,
      resetPreview,
      form,
      clearImportId,
      isPending,
      hasUnresolvedConfirmation,
    ]
  )

  return {
    open,
    form,
    changeOpen,
    text,
    changeText,
    options,
    changeOptions,
    preview,
    error,
    acknowledged,
    setAcknowledged,
    pending: isPending,
    reading,
    readFile: (file: File) => {
      if (hasUnresolvedConfirmation) return
      void readFile(file)
    },
    createPreview,
    editRow,
    excludeRow,
    canConfirm,
    confirm,
    includedCount: included.length,
    hasWarnings,
    hasUnresolvedConfirmation,
  }
}

export type ImportViewModel = ReturnType<typeof useImportPreview>
