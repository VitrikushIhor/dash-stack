import { Readable } from 'node:stream';
import { StoredFileRepositoryPort } from '../../application/ports/stored-file.repository.port';
import { IStorageProvider } from '../../interfaces/storage.interface';
import { StorageService } from '../../storage.service';

describe('StorageService', () => {
  let provider: jest.Mocked<IStorageProvider>;
  let repository: jest.Mocked<StoredFileRepositoryPort>;
  let service: StorageService;

  const file: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 4,
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from('test'),
    stream: Readable.from(Buffer.from('test')),
  };

  beforeEach(() => {
    provider = {
      upload: jest.fn(),
      delete: jest.fn(),
      read: jest.fn(),
      getPublicUrl: jest.fn(),
    };
    repository = {
      create: jest.fn(),
      findKeysByTask: jest.fn(),
      deleteByKeys: jest.fn(),
      findPendingDeletionKeys: jest.fn(),
      findReadableAttachment: jest.fn(),
      markAbandonedAttachmentsPending: jest.fn(),
    };
    service = new StorageService(provider, repository);
  });

  it('should_return_only_authorized_attachment_bytes', async () => {
    repository.findReadableAttachment.mockResolvedValue({ key: 'files/file.pdf', size: 4 });
    provider.read.mockResolvedValue(Buffer.from('test'));

    await expect(service.readAttachment('files/file.pdf', 'member-1')).resolves.toEqual(
      Buffer.from('test'),
    );
    expect(repository.findReadableAttachment).toHaveBeenCalledWith('files/file.pdf', 'member-1');
  });

  it('should_reject_unowned_attachment_without_reading_storage', async () => {
    repository.findReadableAttachment.mockResolvedValue(null);

    await expect(service.readAttachment('files/file.pdf', 'stranger')).rejects.toMatchObject({
      status: 404,
    });
    expect(provider.read).not.toHaveBeenCalled();
  });

  it('should_reject_corrupt_attachment_size', async () => {
    repository.findReadableAttachment.mockResolvedValue({ key: 'files/file.pdf', size: 4 });
    provider.read.mockResolvedValue(Buffer.from('wrong'));

    await expect(service.readAttachment('files/file.pdf', 'member-1')).rejects.toThrow(
      'Stored attachment size mismatch',
    );
  });

  it('should persist attachment ownership after upload', async () => {
    provider.upload.mockResolvedValue({
      key: 'files/generated.pdf',
      url: 'https://files.example/generated.pdf',
      size: 4,
      mimeType: 'application/pdf',
    });

    await service.uploadFile(file, 'files', 'user-1');

    expect(repository.create).toHaveBeenCalledWith({
      key: 'files/generated.pdf',
      ownerUserId: 'user-1',
      kind: 'ATTACHMENT',
      size: 4,
      mimeType: 'application/pdf',
    });
  });

  it('should remove uploaded object when ownership persistence fails', async () => {
    provider.upload.mockResolvedValue({
      key: 'files/orphan.pdf',
      url: 'https://files.example/orphan.pdf',
      size: 4,
      mimeType: 'application/pdf',
    });
    repository.create.mockRejectedValue(new Error('database unavailable'));

    await expect(service.uploadFile(file, 'files', 'user-1')).rejects.toThrow(
      'database unavailable',
    );
    expect(provider.delete).toHaveBeenCalledWith('files/orphan.pdf');
  });
});
