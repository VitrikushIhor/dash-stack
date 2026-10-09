import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { privateAttachmentUrl } from '../private-attachment-url';
import { MAX_FILE_SIZE } from '../storage.constants';
import type {
  IStorageProvider,
  UploadFileDto,
  StorageUploadResult,
} from '../interfaces/storage.interface';
import { StorageUploadException, StorageDeleteException } from '../exceptions/storage.exception';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly privateBucket: string;
  private readonly cloudfrontDomain: string;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('storage.s3Bucket');
    this.privateBucket = this.configService.getOrThrow<string>('storage.privateS3Bucket');
    if (this.privateBucket === this.bucket) {
      throw new Error('Private attachment bucket must differ from the public image bucket');
    }
    this.cloudfrontDomain = this.configService.getOrThrow<string>('storage.cloudfrontDomain');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('storage.s3Region', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('storage.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>('storage.secretAccessKey'),
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
          Bucket: this.bucketForKey(key),
          Key: key,
          Body: dto.buffer,
          ContentType: dto.mimeType,
          ContentDisposition: dto.mimeType.startsWith('image/')
            ? 'inline'
            : `attachment; filename="${encodeURIComponent(dto.originalName)}"`,
          CacheControl: key.startsWith('files/') ? 'private, no-store' : 'public, max-age=31536000',
          // Do NOT set ACL — use bucket policy for public read (more secure)
        }),
      );

      this.logger.log(`File uploaded to S3: ${key} (${dto.buffer.length} bytes)`);

      return {
        key,
        url: this.getPublicUrl(key),
        size: dto.buffer.length,
        mimeType: dto.mimeType,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`S3 upload failed for key "${key}": ${error.message}`, error.stack);
        throw new StorageUploadException(error);
      }
      this.logger.error(`S3 upload failed for key "${key}" with unknown error`);
      throw new StorageUploadException(
        new Error(
          typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error),
        ),
      );
    }
  }

  async read(key: string): Promise<Buffer> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketForKey(key),
        Key: key,
        Range: `bytes=0-${MAX_FILE_SIZE}`,
      }),
      { abortSignal: AbortSignal.timeout(30_000) },
    );
    if (!response.Body) throw new Error('Storage object body is unavailable');
    if (response.ContentLength && response.ContentLength > MAX_FILE_SIZE) {
      throw new Error('Stored attachment exceeds size limit');
    }
    const bytes = Buffer.from(await response.Body.transformToByteArray());
    if (bytes.length > MAX_FILE_SIZE || response.ContentRange?.includes('/')) {
      const totalSize = Number(response.ContentRange?.split('/')[1]);
      if (bytes.length > MAX_FILE_SIZE || totalSize > MAX_FILE_SIZE) {
        throw new Error('Stored attachment exceeds size limit');
      }
    }
    return bytes;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketForKey(key),
          Key: key,
        }),
      );

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`S3 delete failed for key "${key}": ${error.message}`, error.stack);
        throw new StorageDeleteException(error);
      }
      this.logger.error(`S3 delete failed for key "${key}" with unknown error`);
      throw new StorageDeleteException(
        new Error(
          typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error),
        ),
      );
    }
  }

  getPublicUrl(key: string): string {
    if (key.startsWith('files/')) return privateAttachmentUrl(key);
    return `https://${this.cloudfrontDomain}/${key}`;
  }

  private bucketForKey(key: string): string {
    return key.startsWith('files/') ? this.privateBucket : this.bucket;
  }

  private sanitizeExtension(originalName: string): string {
    const ext = extname(originalName).toLowerCase();
    return /^\.[a-z0-9]+$/.test(ext) ? ext : '';
  }
}
