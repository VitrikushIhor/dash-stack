import { StoredFileRepositoryPort } from '../../../../storage/application/ports/stored-file.repository.port';
import { StorageService } from '../../../../storage/storage.service';
import { TaskFileStorageAdapter } from '../../../infrastructure/storage/task-file-storage.adapter';

describe('TaskFileStorageAdapter', () => {
  let storageService: jest.Mocked<StorageService>;
  let repository: jest.Mocked<StoredFileRepositoryPort>;
  let adapter: TaskFileStorageAdapter;

  beforeEach(() => {
    storageService = {
      deleteFile: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;
    repository = {
      create: jest.fn(),
      findKeysByTask: jest.fn(),
      deleteByKeys: jest.fn(),
      findPendingDeletionKeys: jest.fn(),
      findReadableAttachment: jest.fn(),
      markAbandonedAttachmentsPending: jest.fn(),
    };
    adapter = new TaskFileStorageAdapter(storageService, repository);
  });

  it('should return only keys tracked by the requested task', async () => {
    repository.findKeysByTask.mockResolvedValue(['files/owned.pdf']);

    const keys = await adapter.prepareDeletion('task-1', [
      'files/owned.pdf',
      'files/foreign.pdf',
      '../legacy.txt',
    ]);

    expect(keys).toEqual(['files/owned.pdf']);
    expect(repository.findKeysByTask).toHaveBeenCalledWith('task-1', [
      'files/owned.pdf',
      'files/foreign.pdf',
      '../legacy.txt',
    ]);
  });

  it('should delete metadata only after every object deletion succeeds', async () => {
    storageService.deleteFile.mockResolvedValue(undefined);

    await adapter.deleteMany(['files/one.pdf', 'files/two.pdf']);

    expect(repository.deleteByKeys).toHaveBeenCalledWith(['files/one.pdf', 'files/two.pdf']);
  });

  it('should retain metadata when an object deletion fails', async () => {
    storageService.deleteFile.mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(adapter.deleteMany(['files/one.pdf'])).rejects.toThrow('storage unavailable');
    expect(repository.deleteByKeys).not.toHaveBeenCalled();
  });
});
