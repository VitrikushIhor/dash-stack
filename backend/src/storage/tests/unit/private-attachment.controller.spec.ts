import { NotFoundException } from '@nestjs/common';
import { PrivateAttachmentController } from '../../private-attachment.controller';
import { StorageService } from '../../storage.service';

describe('PrivateAttachmentController', () => {
  const storage = { readAttachment: jest.fn<Promise<Buffer>, [string, string]>() };
  const controller = new PrivateAttachmentController(storage as unknown as StorageService);
  const user = { id: 'user-1' };

  beforeEach(() => jest.clearAllMocks());

  it('should_download_valid_key_as_attachment', async () => {
    storage.readAttachment.mockResolvedValue(Buffer.from('test'));
    const key = Buffer.from('files/generated.pdf').toString('base64url');

    const result = await controller.download(key, user);

    expect(storage.readAttachment).toHaveBeenCalledWith('files/generated.pdf', 'user-1');
    expect(result.getHeaders()).toMatchObject({
      type: 'application/octet-stream',
      disposition: 'attachment; filename="generated.pdf"',
      length: 4,
    });
  });

  it.each(['bad!', 'ZmlsZXMvLi4vZXNjYXBl', 'aW1hZ2VzL2ZpbGU', 'ZmlsZXMvLi4'])(
    'should_reject_invalid_key_%s',
    async (key) => {
      await expect(controller.download(key, user)).rejects.toBeInstanceOf(NotFoundException);
      expect(storage.readAttachment).not.toHaveBeenCalled();
    },
  );
});
