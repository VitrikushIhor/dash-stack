export const MAX_IMAGE_WIDTH = 1920;
export const MAX_IMAGE_HEIGHT = 1080;

export const WEBP_QUALITY = 85;

/** Maximum image file size: 10 MB */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/** Maximum general file size: 50 MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_IMAGE_MIMES: string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/** Allowed general file MIME types */
export const ALLOWED_FILE_MIMES: string[] = [
  ...ALLOWED_IMAGE_MIMES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
];
