import { StoredFileRepositoryPort } from '../../application/ports/stored-file.repository.port';
import { PendingFileCleanupService } from '../../infrastructure/maintenance/pending-file-cleanup.service';
import { StorageService } from '../../storage.service';

describe('PendingFileCleanupService', () => {
  let files: jest.Mocked<StoredFileRepositoryPort>;
  let storage: jest.Mocked<Pick<StorageService, 'deleteFile'>>;
  let service: PendingFileCleanupService;

  beforeEach(() => {
    files = {
      create: jest.fn(),
      findKeysByTask: jest.fn(),
      deleteByKeys: jest.fn(),
      findPendingDeletionKeys: jest.fn(),
      findReadableAttachment: jest.fn(),
      markAbandonedAttachmentsPending: jest.fn(),
    };
    storage = { deleteFile: jest.fn() };
    service = new PendingFileCleanupService(storage as unknown as StorageService, files);
  });

  it('should_remove_metadata_only_after_physical_delete_succeeds', async () => {
    files.findPendingDeletionKeys.mockResolvedValue(['files/one.pdf']);
    const before = new Date('2026-09-26T12:00:00.000Z');

    await expect(service.run(before, 20)).resolves.toEqual({
      attempted: 1,
      deleted: 1,
      failed: 0,
    });
    expect(files.findPendingDeletionKeys).toHaveBeenCalledWith(before, 20);
    expect(storage.deleteFile).toHaveBeenCalledWith('files/one.pdf');
    expect(files.deleteByKeys).toHaveBeenCalledWith(['files/one.pdf']);
    expect(storage.deleteFile.mock.invocationCallOrder[0]).toBeLessThan(
      files.deleteByKeys.mock.invocationCallOrder[0],
    );
  });

  it('should_report_failed_key_and_continue_with_next_pending_file', async () => {
    files.findPendingDeletionKeys.mockResolvedValue(['files/fail.pdf', 'files/ok.pdf']);
    storage.deleteFile.mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(service.run(new Date(), 20)).resolves.toEqual({
      attempted: 2,
      deleted: 1,
      failed: 1,
    });
    expect(files.deleteByKeys).toHaveBeenCalledTimes(1);
    expect(files.deleteByKeys).toHaveBeenCalledWith(['files/ok.pdf']);
  });

  it('should_quarantine_only_bounded_abandoned_uploads', async () => {
    files.markAbandonedAttachmentsPending.mockResolvedValue(2);
    const before = new Date('2026-09-25T12:00:00.000Z');

    await expect(service.markAbandoned(before, 20)).resolves.toBe(2);
    expect(files.markAbandonedAttachmentsPending).toHaveBeenCalledWith(before, 20);
  });

  it('should_reject_unbounded_cleanup_batch', async () => {
    await expect(service.run(new Date(), 101)).rejects.toThrow(
      'Invalid pending file cleanup batch',
    );
    expect(files.findPendingDeletionKeys).not.toHaveBeenCalled();
  });
});
