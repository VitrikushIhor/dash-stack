import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3StorageProvider } from '../../providers/s3-storage.provider';

const values: Record<string, string> = {
  'storage.s3Bucket': 'public-images',
  'storage.privateS3Bucket': 'private-files',
  'storage.cloudfrontDomain': 'cdn.example.test',
  'storage.accessKeyId': 'test-key',
  'storage.secretAccessKey': 'test-secret',
};
const config = {
  getOrThrow: (key: string) => values[key],
  get: (key: string, fallback?: string) => values[key] ?? fallback,
} as ConfigService;

describe('S3StorageProvider private attachment isolation', () => {
  let send: jest.SpyInstance;

  beforeEach(() => {
    send = jest.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);
  });

  afterEach(() => send.mockRestore());

  it('should_write_attachments_to_private_bucket_with_no_store', async () => {
    const provider = new S3StorageProvider(config);
    const result = await provider.upload({
      buffer: Buffer.from('test'),
      originalName: 'file.pdf',
      mimeType: 'application/pdf',
      folder: 'files',
    });

    expect(send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
    expect(send.mock.calls[0][0].input).toMatchObject({
      Bucket: 'private-files',
      CacheControl: 'private, no-store',
    });
    expect(result.url).toMatch(/^\/api\/proxy\/storage\/attachments\//);
    await provider.delete(result.key);
    expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectCommand);
    expect(send.mock.calls[1][0].input.Bucket).toBe('private-files');
  });

  it('should_keep_images_in_public_bucket', async () => {
    const provider = new S3StorageProvider(config);
    const result = await provider.upload({
      buffer: Buffer.from('test'),
      originalName: 'image.webp',
      mimeType: 'image/webp',
      folder: 'images',
    });

    expect(send.mock.calls[0][0].input).toMatchObject({
      Bucket: 'public-images',
      CacheControl: 'public, max-age=31536000',
    });
    expect(result.url).toMatch(/^https:\/\/cdn\.example\.test\/images\//);
  });

  it('should_reject_same_public_and_private_bucket', () => {
    const sameBucketConfig = {
      getOrThrow: (key: string) =>
        key === 'storage.privateS3Bucket' ? 'public-images' : values[key],
      get: config.get,
    } as ConfigService;
    expect(() => new S3StorageProvider(sameBucketConfig)).toThrow(
      'Private attachment bucket must differ',
    );
  });
});
