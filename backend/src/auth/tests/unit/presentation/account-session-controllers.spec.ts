import { AuthUser } from '../../../../common/decorators/user.decorator';
import { LinkOAuthAccountUseCase } from '../../../application/use-cases/commands/link-oauth-account.use-case';
import { ManageSessionsUseCase } from '../../../application/use-cases/manage-sessions.use-case';
import { ListLinkedAccountsUseCase } from '../../../application/use-cases/queries/list-linked-accounts.use-case';
import { LinkedAccountsController } from '../../../presentation/controllers/linked-accounts.controller';
import { SessionsController } from '../../../presentation/controllers/sessions.controller';
import { LinkOAuthCodeDto } from '../../../presentation/dto/link-oauth-code.dto';

describe('Auth account and session controllers', () => {
  const user: AuthUser & { sessionId: string } = {
    id: 'user-1',
    email: 'user@example.test',
    sessionId: 'session-1',
  };

  it('should_scope_session_list_to_authenticated_user_and_current_session', async () => {
    const list = jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } });
    const controller = new SessionsController({ list } as unknown as ManageSessionsUseCase);

    await expect(controller.list(user, { page: 2 })).resolves.toEqual({
      data: [],
      meta: { total: 0 },
    });
    expect(list).toHaveBeenCalledWith('user-1', 'session-1', 2);
  });

  it('should_scope_session_revocation_to_authenticated_user', async () => {
    const revoke = jest.fn().mockResolvedValue({ revokedCurrentSession: false });
    const controller = new SessionsController({ revoke } as unknown as ManageSessionsUseCase);

    await expect(controller.revoke(user, { id: 'session-2' })).resolves.toEqual({
      revokedCurrentSession: false,
    });
    expect(revoke).toHaveBeenCalledWith('user-1', 'session-1', 'session-2');
  });

  it('should_scope_linked_account_list_to_authenticated_user', async () => {
    const execute = jest.fn().mockResolvedValue({ providers: ['google'] });
    const controller = new LinkedAccountsController(
      { execute: jest.fn() } as unknown as LinkOAuthAccountUseCase,
      { execute } as unknown as ListLinkedAccountsUseCase,
    );

    await expect(controller.list(user)).resolves.toEqual({ providers: ['google'] });
    expect(execute).toHaveBeenCalledWith('user-1');
  });

  it('should_bind_oauth_link_command_to_authenticated_user', async () => {
    const execute = jest.fn().mockResolvedValue({ linked: true });
    const controller = new LinkedAccountsController(
      { execute } as unknown as LinkOAuthAccountUseCase,
      { execute: jest.fn() } as unknown as ListLinkedAccountsUseCase,
    );
    const data: LinkOAuthCodeDto = {
      code: 'auth-code',
      codeVerifier: 'v'.repeat(43),
      provider: 'google',
    };

    await expect(controller.link(user, data)).resolves.toEqual({ linked: true });
    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
      code: data.code,
      codeVerifier: data.codeVerifier,
      provider: data.provider,
    });
  });
});
