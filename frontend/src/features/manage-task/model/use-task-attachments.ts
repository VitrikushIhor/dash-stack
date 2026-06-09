import { useCallback } from 'react'
import { toast } from 'sonner'
import { type FileUploadProps } from '@/shared/ui/components/file-upload'

export function useTaskAttachments() {
  const onUpload: NonNullable<FileUploadProps['onUpload']> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const totalChunks = 10
            let uploadedChunks = 0
            for (let i = 0; i < totalChunks; i++) {
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100)
              )
              uploadedChunks++
              const progress = (uploadedChunks / totalChunks) * 100
              onProgress(file, progress)
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
            onSuccess(file)
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error('Upload failed')
            )
          }
        })
        await Promise.all(uploadPromises)
      } catch (_error) {
        // Error handling
      }
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
