export const STORAGE_ERRORS = {
  INVALID_IMAGE_TYPE: (mimetype: string, allowed: string[]) =>
    `Invalid image type: ${mimetype}. Allowed types: ${allowed.join(', ')}`,
  INVALID_FILE_TYPE: (mimetype: string, allowed: string[]) =>
    `Invalid file type: ${mimetype}. Allowed types: ${allowed.join(', ')}`,
  IMAGE_TOO_LARGE: (size: number, max: number) =>
    `Image too large: ${(size / 1024 / 1024).toFixed(1)}MB. Maximum: ${max / 1024 / 1024}MB`,
  FILE_TOO_LARGE: (size: number, max: number) =>
    `File too large: ${(size / 1024 / 1024).toFixed(1)}MB. Maximum: ${max / 1024 / 1024}MB`,
  NO_FILE_PROVIDED: 'No file provided',
  UPLOAD_FAILED: 'Failed to upload file to storage',
  DELETE_FAILED: 'Failed to delete file from storage',
} as const;
