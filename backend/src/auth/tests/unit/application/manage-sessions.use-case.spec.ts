import { NotFoundException } from '../../../../common/exceptions/domain.exception';
import { SessionManagementPort } from '../../../application/ports/outgoing/session-management.port';
import { ManageSessionsUseCase } from '../../../application/use-cases/manage-sessions.use-case';

describe('ManageSessionsUseCase', () => {
  let sessions: jest.Mocked<SessionManagementPort>;
  let useCase: ManageSessionsUseCase;

  beforeEach(() => {
    sessions = { listActive: jest.fn(), revokeOwned: jest.fn() };
    useCase = new ManageSessionsUseCase(sessions);
  });

  it('should_mark_only_the_current_session_and_preserve_pagination_when_listing', async () => {
    const createdAt = new Date('2026-09-01T10:00:00.000Z');
    const lastUsedAt = new Date('2026-09-02T10:00:00.000Z');
    const expiresAt = new Date('2026-10-01T10:00:00.000Z');
    const meta = { total: 2, lastPage: 1, currentPage: 1, perPage: 20, prev: null, next: null };
    sessions.listActive.mockResolvedValue({
      data: [
        { id: 'current', createdAt, lastUsedAt, expiresAt, userAgent: 'Browser A' },
        { id: 'other', createdAt, lastUsedAt, expiresAt, userAgent: null },
      ],
      meta,
    });

    const result = await useCase.list('user-1', 'current', 1);

    expect(sessions.listActive).toHaveBeenCalledWith('user-1', expect.any(Date), 1, 20);
    expect(result).toEqual({
      data: [
        {
          id: 'current',
          createdAt: createdAt.toISOString(),
          lastUsedAt: lastUsedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          userAgent: 'Browser A',
          isCurrent: true,
        },
        {
          id: 'other',
          createdAt: createdAt.toISOString(),
          lastUsedAt: lastUsedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          userAgent: null,
          isCurrent: false,
        },
      ],
      meta,
    });
  });

  it('should_report_current_session_revocation_when_owned', async () => {
    sessions.revokeOwned.mockResolvedValue(true);

    await expect(useCase.revoke('user-1', 'current', 'current')).resolves.toEqual({
      revokedCurrentSession: true,
    });
    expect(sessions.revokeOwned).toHaveBeenCalledWith('user-1', 'current', expect.any(Date));
  });

  it('should_report_other_session_revocation_when_owned', async () => {
    sessions.revokeOwned.mockResolvedValue(true);

    await expect(useCase.revoke('user-1', 'current', 'other')).resolves.toEqual({
      revokedCurrentSession: false,
    });
  });

  it('should_reject_revocation_when_session_is_not_owned', async () => {
    sessions.revokeOwned.mockResolvedValue(false);

    await expect(useCase.revoke('user-1', 'current', 'foreign')).rejects.toThrow(NotFoundException);
  });
});
