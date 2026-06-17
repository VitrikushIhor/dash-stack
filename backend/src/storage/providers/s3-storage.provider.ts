import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
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
export class S3StorageProvider implements IStorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontDomain: string;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('storage.s3Bucket');
    this.cloudfrontDomain = this.configService.getOrThrow<string>(
      'storage.cloudfrontDomain',
    );

    this.s3Client = new S3Client({
      region: this.configService.get<string>('storage.s3Region', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'storage.accessKeyId',
        ),
        secretAccessKey: this.configService.getOrThrow<string>(
          'storage.secretAccessKey',
        ),
      },
    });

    this.logger.log(
      `S3 provider initialized — bucket: ${this.bucket}, region: ${this.configService.get('storage.s3Region')}`,
    );
  }

  async upload(dto: UploadFileDto): Promise<StorageUploadResult> {
    const ext = this.sanitizeExtension(dto.originalName);
    const key = `${dto.folder}/${randomUUID()}${ext}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: dto.buffer,
          ContentType: dto.mimeType,
          ContentDisposition: dto.mimeType.startsWith('image/')
            ? 'inline'
            : `attachment; filename="${encodeURIComponent(dto.originalName)}"`,
          CacheControl: 'public, max-age=31536000',
          // Do NOT set ACL — use bucket policy for public read (more secure)
        }),
      );

      this.logger.log(
        `File uploaded to S3: ${key} (${dto.buffer.length} bytes)`,
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
          `S3 upload failed for key "${key}": ${error.message}`,
          error.stack,
        );
        throw new StorageUploadException(error);
      }
      this.logger.error(`S3 upload failed for key "${key}" with unknown error`);
      throw new StorageUploadException(new Error(String(error)));
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `S3 delete failed for key "${key}": ${error.message}`,
          error.stack,
        );
        throw new StorageDeleteException(error);
      }
      this.logger.error(`S3 delete failed for key "${key}" with unknown error`);
      throw new StorageDeleteException(new Error(String(error)));
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.cloudfrontDomain}/${key}`;
  }

  private sanitizeExtension(originalName: string): string {
    const ext = extname(originalName).toLowerCase();
    return /^\.[a-z0-9]+$/.test(ext) ? ext : '';
  }
}
