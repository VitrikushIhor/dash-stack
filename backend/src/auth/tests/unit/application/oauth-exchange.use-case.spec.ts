import { OAuthExchangeUseCase } from '../../../../../src/auth/application/use-cases/commands/oauth-exchange.use-case';

describe('OAuthExchangeUseCase', () => {
  let useCase: OAuthExchangeUseCase;
  let userRepoMock: any;
  let accountRepoMock: any;
  let tokenGeneratorMock: any;
  let auth0ClientMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    accountRepoMock = {
      findByProvider: jest.fn(),
      create: jest.fn(),
    };
    tokenGeneratorMock = {
      generateTokens: jest.fn(),
    };
    auth0ClientMock = {
      getUserInfo: jest.fn(),
    };

    useCase = new OAuthExchangeUseCase(
      userRepoMock,
      accountRepoMock,
      tokenGeneratorMock,
      auth0ClientMock,
    );
  });

  it('should login existing user if account exists', async () => {
    auth0ClientMock.getUserInfo.mockResolvedValue({
      sub: 'google-oauth2|123',
      email: 'test@g.com',
    });
    accountRepoMock.findByProvider.mockResolvedValue({
      user: { id: 'user-1' },
    });
    tokenGeneratorMock.generateTokens.mockReturnValue({ accessToken: 'acc' });

    const result = await useCase.execute({ auth0Token: 'token' });

    expect(accountRepoMock.findByProvider).toHaveBeenCalledWith(
      'google',
      '123',
    );
    expect(tokenGeneratorMock.generateTokens).toHaveBeenCalledWith('user-1');
    expect(userRepoMock.create).not.toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'acc' });
  });

  it('should link new account to existing user by email', async () => {
    auth0ClientMock.getUserInfo.mockResolvedValue({
      sub: 'github|456',
      email: 'test@g.com',
    });
    accountRepoMock.findByProvider.mockResolvedValue(null);
    userRepoMock.findByEmail.mockResolvedValue({ id: 'user-2' });
    tokenGeneratorMock.generateTokens.mockReturnValue({ accessToken: 'acc' });

    await useCase.execute({ auth0Token: 'token' });

    expect(accountRepoMock.create).toHaveBeenCalledWith({
      userId: 'user-2',
      provider: 'github',
      providerAccountId: '456',
    });
  });

  it('should create new user and account if neither exist', async () => {
    auth0ClientMock.getUserInfo.mockResolvedValue({
      sub: 'auth0|789',
      email: 'new@g.com',
      name: 'John Doe',
    });
    accountRepoMock.findByProvider.mockResolvedValue(null);
    userRepoMock.findByEmail.mockResolvedValue(null);
    userRepoMock.create.mockResolvedValue({ id: 'user-3' });

    await useCase.execute({ auth0Token: 'token' });

    expect(userRepoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@g.com',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );
    expect(accountRepoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-3',
        provider: 'auth0',
        providerAccountId: '789',
      }),
    );
  });
});
