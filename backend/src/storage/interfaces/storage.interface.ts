export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface IStorageProvider {
  upload(dto: UploadFileDto): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

export interface UploadFileDto {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: string;
}

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}
