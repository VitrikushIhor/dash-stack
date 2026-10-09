'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ImportDialogProps } from '../model/dialog/import-dialog.types'
import { useImportSearchParams } from '../model/dialog/import-search-params'
import { ImportDialogLoading } from './import-dialog-loading'

const ImportDialogSession = dynamic(
  () =>
    import('./import-dialog-session').then((mod) => mod.ImportDialogSession),
  { loading: ImportDialogLoading }
)

export function ImportDialog(props: ImportDialogProps) {
  const [params] = useImportSearchParams()
  const open = params['import-cards']
  const [hasOpened, setHasOpened] = useState(open)

  if (open && !hasOpened) setHasOpened(true)

  return hasOpened ? (
    <ImportDialogSession {...props} />
  ) : (
    <ImportDialogLoading />
  )
}
