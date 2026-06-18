import { api } from './api-client'

export interface UploadResponse {
  key: string
  url: string
  size: number
  mimeType: string
}

export interface FileWithServerData extends File {
  s3Key?: string
  s3Url?: string
}

/**
 * Attach server metadata to a File after a successful upload.
 * Mutates the original object so it stays referentially equal
 * inside react-hook-form's state.
 */
export function attachServerData(
  file: File,
  data: Pick<UploadResponse, 'key' | 'url'>
): FileWithServerData {
  const f = file as FileWithServerData
  f.s3Key = data.key
  f.s3Url = data.url
  return f
}

export function createFileFromKey(key: string): FileWithServerData {
  const filename = key.split('/').pop() ?? key
  const file = new File([], filename) as FileWithServerData
  file.s3Key = key
  return file
}

export const storageApi = {
  uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<UploadResponse>('/storage/image', formData)
  },

  uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<UploadResponse>('/storage/file', formData)
  },
}
