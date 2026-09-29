import { LinkOAuthAccountUseCase } from '../../../application/use-cases/commands/link-oauth-account.use-case';
import { Auth0ClientPort } from '../../../application/ports/outgoing/auth0-client.port';
import { LinkedAccountsPort } from '../../../application/ports/outgoing/linked-accounts.port';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';

describe('LinkOAuthAccountUseCase', () => {
  let auth0: jest.Mocked<Auth0ClientPort>;
  let accounts: jest.Mocked<LinkedAccountsPort>;
  let useCase: LinkOAuthAccountUseCase;
  const command = {
    userId: 'current-user',
    code: 'code',
    codeVerifier: 'verifier',
    provider: 'google',
  };
  beforeEach(() => {
    auth0 = { getUserInfo: jest.fn(), exchangeCode: jest.fn() };
    accounts = { list: jest.fn(), link: jest.fn() };
    useCase = new LinkOAuthAccountUseCase(auth0, accounts);
  });
  it('should_link_verified_provider_identity_to_authenticated_actor', async () => {
    auth0.exchangeCode.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: 'provider@example.test',
      email_verified: true,
    });
    await expect(useCase.execute(command)).resolves.toEqual({ linked: true });
    expect(accounts.link).toHaveBeenCalledWith('current-user', 'google', '123');
  });
  it.each([
    { sub: 'google-oauth2|123', email: 'provider@example.test', email_verified: false },
    { sub: 'github|123', email: 'provider@example.test', email_verified: true },
    { sub: 'malformed', email: 'provider@example.test', email_verified: true },
  ])('should_reject_unverified_or_unexpected_identity_%j', async (identity) => {
    auth0.exchangeCode.mockResolvedValue(identity);
    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
    expect(accounts.link).not.toHaveBeenCalled();
  });
  it('should_surface_link_conflict_without_changing_identity', async () => {
    auth0.exchangeCode.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: 'provider@example.test',
      email_verified: true,
    });
    accounts.link.mockRejectedValue(new Error('Already linked'));
    await expect(useCase.execute(command)).rejects.toThrow('Already linked');
  });
});
