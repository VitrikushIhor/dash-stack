import { useCallback } from 'react'
import { toast } from 'sonner'
import { storageApi, attachServerData } from '@/shared/api'
import { type FileUploadProps } from '@/shared/ui'

/** Pseudo-progress simulation interval (ms) */
const PROGRESS_TICK_MS = 200
/** Progress increment per tick */
const PROGRESS_STEP = 10
/** Cap before the real response arrives */
const PROGRESS_CAP = 90

export function useAttachments() {
  const onUpload: NonNullable<FileUploadProps['onUpload']> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      const promises = files.map(async (file) => {
        let progress = 0
        const interval = setInterval(() => {
          progress = Math.min(progress + PROGRESS_STEP, PROGRESS_CAP)
          onProgress(file, progress)
        }, PROGRESS_TICK_MS)

        try {
          const response = await storageApi.uploadFile(file)

          clearInterval(interval)
          attachServerData(file, response)
          onProgress(file, 100)
          onSuccess(file)
        } catch (error) {
          clearInterval(interval)
          onError(
            file,
            error instanceof Error ? error : new Error('Upload failed')
          )
        }
      })

      await Promise.allSettled(promises)
    },
    []
  )

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }, [])

  return { onUpload, onFileReject }
}
