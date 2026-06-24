import { InvitationController } from '../../../presentation/controllers/invitation.controller';
import { SendInviteUseCase } from '../../../application/use-cases/send-invite.use-case';
import { ListPendingInvitationsUseCase } from '../../../application/use-cases/list-pending-invitations.use-case';
import { RevokeInviteUseCase } from '../../../application/use-cases/revoke-invite.use-case';
import { OrgRole, User } from '@prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
} as User;

describe('InvitationController', () => {
  let controller: InvitationController;
  let sendInviteUseCase: jest.Mocked<Pick<SendInviteUseCase, 'execute'>>;
  let listPendingUseCase: jest.Mocked<
    Pick<ListPendingInvitationsUseCase, 'execute'>
  >;
  let revokeInviteUseCase: jest.Mocked<Pick<RevokeInviteUseCase, 'execute'>>;

  beforeEach(() => {
    sendInviteUseCase = { execute: jest.fn() };
    listPendingUseCase = { execute: jest.fn() };
    revokeInviteUseCase = { execute: jest.fn() };
    controller = new InvitationController(
      sendInviteUseCase as any,
      listPendingUseCase as any,
      revokeInviteUseCase as any,
    );
  });

  describe('sendInvite()', () => {
    it('maps DTO to command and calls SendInviteUseCase', async () => {
      const dto = { email: 'new@example.com', role: OrgRole.MEMBER };
      const expected = { id: 'inv-1' };
      sendInviteUseCase.execute.mockResolvedValue(expected as any);

      const result = await controller.sendInvite('org-1', mockUser, dto);

      expect(result).toBe(expected);
      expect(sendInviteUseCase.execute).toHaveBeenCalledWith(
        'org-1',
        'user-1',
        {
          email: 'new@example.com',
          role: OrgRole.MEMBER,
        },
      );
    });

    it('passes orgId and user.id correctly', async () => {
      const dto = { email: 'test@test.com', role: OrgRole.ADMIN };
      sendInviteUseCase.execute.mockResolvedValue({} as any);

      await controller.sendInvite(
        'org-abc',
        { ...mockUser, id: 'admin-5' } as User,
        dto,
      );

      expect(sendInviteUseCase.execute).toHaveBeenCalledWith(
        'org-abc',
        'admin-5',
        expect.objectContaining({ email: 'test@test.com' }),
      );
    });
  });

  describe('listPending()', () => {
    it('calls ListPendingInvitationsUseCase with orgId', async () => {
      const invitations = [{ id: 'inv-1' }, { id: 'inv-2' }];
      listPendingUseCase.execute.mockResolvedValue(invitations as any);

      const result = await controller.listPending('org-1');

      expect(result).toBe(invitations);
      expect(listPendingUseCase.execute).toHaveBeenCalledWith('org-1');
    });
  });

  describe('revokeInvite()', () => {
    it('calls RevokeInviteUseCase with id and orgId', async () => {
      revokeInviteUseCase.execute.mockResolvedValue(undefined);

      await controller.revokeInvite('org-1', 'inv-1');

      expect(revokeInviteUseCase.execute).toHaveBeenCalledWith(
        'inv-1',
        'org-1',
      );
    });
  });
});
