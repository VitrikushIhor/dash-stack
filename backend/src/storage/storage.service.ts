import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import {
  type IStorageProvider,
  STORAGE_PROVIDER,
  type StorageUploadResult,
} from './interfaces/storage.interface';

import { StorageValidationException } from './exceptions/storage.exception';
import { STORAGE_ERRORS } from './exceptions/storage-errors';
import {
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  WEBP_QUALITY,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_FILE_MIMES,
} from './storage.constants';
import {
  StoredFileKind,
  StoredFileRepositoryPort,
} from './application/ports/stored-file.repository.port';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: IStorageProvider,
    @Inject('StoredFileRepositoryPort')
    private readonly storedFileRepository: StoredFileRepositoryPort,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    ownerUserId: string,
  ): Promise<StorageUploadResult> {
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new StorageValidationException(
        STORAGE_ERRORS.INVALID_IMAGE_TYPE(file.mimetype, ALLOWED_IMAGE_MIMES),
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new StorageValidationException(
        STORAGE_ERRORS.IMAGE_TOO_LARGE(file.size, MAX_IMAGE_SIZE),
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

    const result = await this.provider.upload({
      buffer: optimizedBuffer,
      originalName: file.originalname.replace(/\.[^.]+$/, '.webp'),
      mimeType: 'image/webp',
      folder,
    });

    await this.recordUpload(result, ownerUserId, StoredFileKind.IMAGE);
    return result;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    ownerUserId: string,
  ): Promise<StorageUploadResult> {
    if (!ALLOWED_FILE_MIMES.includes(file.mimetype)) {
      throw new StorageValidationException(
        STORAGE_ERRORS.INVALID_FILE_TYPE(file.mimetype, ALLOWED_FILE_MIMES),
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new StorageValidationException(STORAGE_ERRORS.FILE_TOO_LARGE(file.size, MAX_FILE_SIZE));
    }

    const result = await this.provider.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder,
    });

    await this.recordUpload(result, ownerUserId, StoredFileKind.ATTACHMENT);
    return result;
  }

  async readAttachment(key: string, userId: string): Promise<Buffer> {
    const file = await this.storedFileRepository.findReadableAttachment(key, userId);
    if (!file) throw new NotFoundException('Attachment not found');

    const bytes = await this.provider.read(file.key);
    if (bytes.length !== file.size) throw new Error('Stored attachment size mismatch');
    return bytes;
  }

  async deleteFile(key: string): Promise<void> {
    await this.provider.delete(key);
  }

  getPublicUrl(key: string): string {
    return this.provider.getPublicUrl(key);
  }

  private async recordUpload(
    result: StorageUploadResult,
    ownerUserId: string,
    kind: StoredFileKind,
  ): Promise<void> {
    try {
      await this.storedFileRepository.create({
        key: result.key,
        ownerUserId,
        kind,
        size: result.size,
        mimeType: result.mimeType,
      });
    } catch (error) {
      await this.provider.delete(result.key);
      throw error;
    }
  }
}
