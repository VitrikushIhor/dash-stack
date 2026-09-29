import { OAuthExchangeUseCase } from '../../../application/use-cases/commands/oauth-exchange.use-case';
import {
  UserRepositoryPort,
  UserSummary,
} from '../../../application/ports/outgoing/user.repository.port';
import { AccountRepositoryPort } from '../../../application/ports/outgoing/account.repository.port';
import { TokenGeneratorPort } from '../../../application/ports/outgoing/token-generator.port';
import { Auth0ClientPort } from '../../../application/ports/outgoing/auth0-client.port';
import { OAuthSignupTransactionPort } from '../../../application/ports/outgoing/oauth-signup-transaction.port';
import {
  ConflictException,
  UnauthorizedException,
} from '../../../../common/exceptions/domain.exception';

const user: UserSummary = {
  id: 'user-1',
  email: 'test@g.com',
  firstName: null,
  lastName: null,
  avatar: null,
  emailVerified: null,
  dob: null,
  bio: null,
  urls: [],
};
const tokens = { accessToken: 'access', refreshToken: 'credential' };

describe('OAuthExchangeUseCase', () => {
  let useCase: OAuthExchangeUseCase;
  let users: jest.Mocked<UserRepositoryPort>;
  let accounts: jest.Mocked<AccountRepositoryPort>;
  let generator: jest.Mocked<TokenGeneratorPort>;
  let auth0: jest.Mocked<Auth0ClientPort>;
  let signup: jest.Mocked<OAuthSignupTransactionPort>;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateEmailVerified: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
    };
    accounts = { findByProvider: jest.fn(), create: jest.fn() };
    generator = {
      generateTokens: jest.fn().mockResolvedValue(tokens),
      generateAccessToken: jest.fn(),
      getSessionExpiresAt: jest.fn(),
    };
    auth0 = { getUserInfo: jest.fn(), exchangeCode: jest.fn() };
    signup = { create: jest.fn().mockResolvedValue('user-1') };
    auth0.getUserInfo.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: user.email,
      email_verified: true,
      name: 'John Doe',
    });
    useCase = new OAuthExchangeUseCase(users, accounts, generator, auth0, signup);
  });

  it('should_login_existing_provider_account_without_creating_user', async () => {
    accounts.findByProvider.mockResolvedValue({ user: { id: user.id, email: user.email } });
    await expect(useCase.execute({ auth0Token: 'token' })).resolves.toEqual(tokens);
    expect(generator.generateTokens).toHaveBeenCalledWith(user.id);
    expect(signup.create).not.toHaveBeenCalled();
  });

  it('should_forward_browser_details_when_authorization_code_creates_session', async () => {
    auth0.exchangeCode.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: user.email,
      email_verified: true,
    });
    accounts.findByProvider.mockResolvedValue({ user: { id: user.id, email: user.email } });
    await useCase.executeCode('code', 'verifier', 'Browser test agent');
    expect(generator.generateTokens).toHaveBeenCalledWith(user.id, 'Browser test agent');
  });

  it('should_authenticate_only_after_authorization_code_exchange', async () => {
    auth0.exchangeCode.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: user.email,
      email_verified: true,
    });
    accounts.findByProvider.mockResolvedValue({ user });
    await expect(useCase.executeCode('code', 'verifier')).resolves.toEqual(tokens);
    expect(auth0.exchangeCode).toHaveBeenCalledWith('code', 'verifier');
    expect(auth0.getUserInfo).not.toHaveBeenCalled();
  });

  it('should_reject_automatic_linking_to_existing_email', async () => {
    accounts.findByProvider.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(user);
    await expect(useCase.execute({ auth0Token: 'token' })).rejects.toThrow(ConflictException);
    expect(signup.create).not.toHaveBeenCalled();
    expect(generator.generateTokens).not.toHaveBeenCalled();
  });

  it('should_create_user_and_provider_account_through_one_transaction', async () => {
    accounts.findByProvider.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ auth0Token: 'token' })).resolves.toEqual(tokens);
    expect(signup.create).toHaveBeenCalledWith({
      user: {
        email: user.email,
        firstName: 'John',
        lastName: 'Doe',
        avatar: null,
        emailVerified: expect.any(Date),
      },
      provider: 'google',
      providerAccountId: '123',
    });
    expect(users.create).not.toHaveBeenCalled();
    expect(accounts.create).not.toHaveBeenCalled();
  });

  it('should_not_issue_session_when_atomic_signup_fails', async () => {
    accounts.findByProvider.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    signup.create.mockRejectedValue(new Error('Account insert failed'));
    await expect(useCase.execute({ auth0Token: 'token' })).rejects.toThrow('Account insert failed');
    expect(generator.generateTokens).not.toHaveBeenCalled();
  });

  it.each([false, undefined])('should_reject_unverified_identity_%s', async (email_verified) => {
    auth0.getUserInfo.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: user.email,
      email_verified,
    });
    await expect(useCase.execute({ auth0Token: 'token' })).rejects.toThrow(UnauthorizedException);
    expect(accounts.findByProvider).not.toHaveBeenCalled();
  });

  it('should_reject_malformed_provider_identity', async () => {
    auth0.getUserInfo.mockResolvedValue({
      sub: 'malformed',
      email: user.email,
      email_verified: true,
    });
    await expect(useCase.execute({ auth0Token: 'token' })).rejects.toThrow(UnauthorizedException);
    expect(accounts.findByProvider).not.toHaveBeenCalled();
  });
});
