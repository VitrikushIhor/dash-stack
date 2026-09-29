import { VerifyEmailUseCase } from '../../../../../src/auth/application/use-cases/commands/verify-email.use-case';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let verificationTokenRepoMock: any;
  let tokenGeneratorMock: any;
  let oneTimeTokenMock: any;
  let sessionCredentialMock: any;
  let emailVerificationTransactionMock: any;

  beforeEach(() => {
    verificationTokenRepoMock = {
      findByToken: jest.fn(),
      deleteById: jest.fn(),
    };
    tokenGeneratorMock = {
      generateAccessToken: jest.fn(),
      getSessionExpiresAt: jest.fn(),
    };
    oneTimeTokenMock = {
      hash: jest.fn().mockReturnValue('token-hash'),
    };
    sessionCredentialMock = {
      create: jest.fn().mockReturnValue({ raw: 'raw-session', hash: 'session-hash' }),
    };
    emailVerificationTransactionMock = {
      complete: jest.fn(),
    };

    useCase = new VerifyEmailUseCase(
      verificationTokenRepoMock,
      tokenGeneratorMock,
      oneTimeTokenMock,
      sessionCredentialMock,
      emailVerificationTransactionMock,
    );
  });

  it('should successfully verify email and generate tokens', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      email: 'test@example.com',
      token: 'token-hash',
      type: AuthTokenType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 10000),
    });
    tokenGeneratorMock.getSessionExpiresAt.mockReturnValue(new Date('2026-10-02T10:00:00.000Z'));
    tokenGeneratorMock.generateAccessToken.mockReturnValue('access-token');
    emailVerificationTransactionMock.complete.mockResolvedValue({
      userId: 'user-1',
      sessionId: 'session-1',
    });

    const result = await useCase.execute({ token: 'valid' });

    expect(verificationTokenRepoMock.findByToken).toHaveBeenCalledWith('token-hash');
    expect(emailVerificationTransactionMock.complete).toHaveBeenCalledWith({
      tokenId: 'token-1',
      tokenHash: 'token-hash',
      email: 'test@example.com',
      credentialHash: 'session-hash',
      sessionExpiresAt: new Date('2026-10-02T10:00:00.000Z'),
      now: expect.any(Date),
    });
    expect(tokenGeneratorMock.generateAccessToken).toHaveBeenCalledWith('user-1', 'session-1');
    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'raw-session' });
  });

  it('should throw BadRequestException if token not found', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue(null);
    await expect(useCase.execute({ token: 'invalid' })).rejects.toThrow(BadRequestException);
  });

  it('should reject verification when token was consumed concurrently', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      email: 'test@example.com',
      token: 'token-hash',
      type: AuthTokenType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 10_000),
    });
    tokenGeneratorMock.getSessionExpiresAt.mockReturnValue(new Date(Date.now() + 10_000));
    emailVerificationTransactionMock.complete.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'valid' })).rejects.toThrow(BadRequestException);
    expect(tokenGeneratorMock.generateAccessToken).not.toHaveBeenCalled();
  });
});
