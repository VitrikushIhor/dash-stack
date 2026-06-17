import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdir, writeFile, unlink } from 'fs/promises';
import type {
  IStorageProvider,
  UploadFileDto,
  StorageUploadResult,
} from '../interfaces/storage.interface';
import {
  StorageUploadException,
  StorageDeleteException,
} from '../exceptions/storage.exception';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadDir: string;
  private readonly port: number;
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = join(process.cwd(), 'uploads');
    this.port = this.configService.get<number>('nest.port', 8000);

    this.logger.log(
      `Local storage provider initialized — uploads dir: ${this.uploadDir}`,
    );
  }

  async upload(dto: UploadFileDto): Promise<StorageUploadResult> {
    const ext = this.sanitizeExtension(dto.originalName);
    const key = `${dto.folder}/${randomUUID()}${ext}`;
    const filePath = join(this.uploadDir, key);
    const dirPath = join(this.uploadDir, dto.folder);

    try {
      await mkdir(dirPath, { recursive: true });
      await writeFile(filePath, dto.buffer);

      this.logger.log(
        `File saved locally: ${key} (${dto.buffer.length} bytes)`,
      );

      return {
        key,
        url: this.getPublicUrl(key),
        size: dto.buffer.length,
        mimeType: dto.mimeType,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Local upload failed for key "${key}": ${error.message}`,
          error.stack,
        );
        throw new StorageUploadException(error);
      }
      this.logger.error(
        `Local upload failed for key "${key}" with unknown error`,
      );
      throw new StorageUploadException(new Error(String(error)));
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.uploadDir, key);

    try {
      await unlink(filePath);
      this.logger.log(`File deleted locally: ${key}`);
    } catch (error) {
      if (error instanceof Error) {
        // If the file doesn't exist, silently succeed — same behavior as S3
        if ((error as any).code === 'ENOENT') {
          this.logger.warn(
            `File not found during delete (already removed): ${key}`,
          );
          return;
        }
        this.logger.error(
          `Local delete failed for key "${key}": ${error.message}`,
          error.stack,
        );
        throw new StorageDeleteException(error);
      }
      this.logger.error(
        `Local delete failed for key "${key}" with unknown error`,
      );
      throw new StorageDeleteException(new Error(String(error)));
    }
  }

  getPublicUrl(key: string): string {
    return `http://localhost:${this.port}/uploads/${key}`;
  }

  private sanitizeExtension(originalName: string): string {
    const ext = extname(originalName).toLowerCase();
    return /^\.[a-z0-9]+$/.test(ext) ? ext : '';
  }
}
