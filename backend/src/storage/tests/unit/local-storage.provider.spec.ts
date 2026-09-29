import { unlink } from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import { StorageValidationException } from '../../exceptions/storage.exception';
import { LocalStorageProvider } from '../../providers/local-storage.provider';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

describe('LocalStorageProvider', () => {
  const configService = {
    get: jest.fn().mockReturnValue(8000),
  } as unknown as ConfigService;

  let provider: LocalStorageProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new LocalStorageProvider(configService);
  });

  it.each(['../secret.txt', '../../secret.txt', '/etc/passwd', '..\\secret.txt', '%2e%2e/secret'])(
    'should reject unsafe delete key %s before accessing the filesystem',
    async (key) => {
      await expect(provider.delete(key)).rejects.toThrow(StorageValidationException);
      expect(unlink).not.toHaveBeenCalled();
    },
  );

  it('should delete a generated relative storage key', async () => {
    jest.mocked(unlink).mockResolvedValue(undefined);

    await provider.delete('files/generated-id.pdf');

    expect(unlink).toHaveBeenCalledWith(
      expect.stringMatching(/uploads\/files\/generated-id\.pdf$/),
    );
  });
});
