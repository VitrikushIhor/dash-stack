import { Inject, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import type {
  IStorageProvider,
  StorageUploadResult,
} from './interfaces/storage.interface';
import { STORAGE_PROVIDER } from './interfaces/storage.interface';
import { StorageValidationException } from './exceptions/storage.exception';
import {
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  WEBP_QUALITY,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_FILE_MIMES,
} from './storage.constants';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: IStorageProvider,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<StorageUploadResult> {
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new StorageValidationException(
        `Invalid image type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new StorageValidationException(
        `Image too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }

    const optimizedBuffer = await sharp(file.buffer)
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    this.logger.log(
      `Image optimized: ${file.originalname} — ${file.size} → ${optimizedBuffer.length} bytes (${((1 - optimizedBuffer.length / file.size) * 100).toFixed(0)}% reduction)`,
    );

    return this.provider.upload({
      buffer: optimizedBuffer,
      originalName: file.originalname.replace(/\.[^.]+$/, '.webp'),
      mimeType: 'image/webp',
      folder,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<StorageUploadResult> {
    if (!ALLOWED_FILE_MIMES.includes(file.mimetype)) {
      throw new StorageValidationException(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_FILE_MIMES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new StorageValidationException(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    return this.provider.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder,
    });
  }

  async deleteFile(key: string): Promise<void> {
    await this.provider.delete(key);
  }

  getPublicUrl(key: string): string {
    return this.provider.getPublicUrl(key);
  }
}
