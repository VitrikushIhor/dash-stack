import { InvitationAcceptController } from '../../../presentation/controllers/invitation-accept.controller';
import { AcceptInviteUseCase } from '../../../application/use-cases/accept-invite.use-case';
import { User } from '@prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
} as User;

describe('InvitationAcceptController', () => {
  let controller: InvitationAcceptController;
  let acceptInviteUseCase: jest.Mocked<Pick<AcceptInviteUseCase, 'execute'>>;

  beforeEach(() => {
    acceptInviteUseCase = { execute: jest.fn() };
    controller = new InvitationAcceptController(acceptInviteUseCase as any);
  });

  describe('acceptInvite()', () => {
    it('builds AcceptInviteCommand and calls use-case', async () => {
      const membership = { id: 'mem-1' };
      acceptInviteUseCase.execute.mockResolvedValue(membership);

      const result = await controller.acceptInvite('token-abc', mockUser);

      expect(result).toBe(membership);
      expect(acceptInviteUseCase.execute).toHaveBeenCalledWith({
        token: 'token-abc',
        userId: 'user-1',
        userEmail: 'user@example.com',
      });
    });

    it('passes token from route param', async () => {
      acceptInviteUseCase.execute.mockResolvedValue({});

      await controller.acceptInvite('different-token', mockUser);

      expect(acceptInviteUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'different-token' }),
      );
    });

    it('passes user fields from decorator', async () => {
      const otherUser = { id: 'user-99', email: 'other@test.com' } as User;
      acceptInviteUseCase.execute.mockResolvedValue({});

      await controller.acceptInvite('token-abc', otherUser);

      expect(acceptInviteUseCase.execute).toHaveBeenCalledWith({
        token: 'token-abc',
        userId: 'user-99',
        userEmail: 'other@test.com',
      });
    });
  });
});
