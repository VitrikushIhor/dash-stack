import { useMutation } from '@tanstack/react-query'
import { storageApi } from './storage-api'

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => storageApi.uploadImage(file),
  })
}
