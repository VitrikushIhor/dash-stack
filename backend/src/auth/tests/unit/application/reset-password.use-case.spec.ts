import { PasswordHasherPort } from '../../../../../src/auth/application/ports/outgoing/password-hasher.port';
import { PasswordResetTransactionPort } from '../../../../../src/auth/application/ports/outgoing/password-reset-transaction.port';
import { OneTimeTokenPort } from '../../../../../src/auth/application/ports/outgoing/one-time-token.port';
import { VerificationTokenRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/verification-token.repository.port';
import { ResetPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/reset-password.use-case';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let verificationTokenRepo: jest.Mocked<VerificationTokenRepositoryPort>;
  let passwordResetTransaction: jest.Mocked<PasswordResetTransactionPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let oneTimeToken: jest.Mocked<OneTimeTokenPort>;

  const validResetToken = {
    id: 'token-1',
    email: 'test@example.com',
    token: 'valid-token',
    type: AuthTokenType.PASSWORD_RESET,
    expires: new Date(Date.now() + 10_000),
  };

  beforeEach(() => {
    verificationTokenRepo = {
      findByToken: jest.fn(),
      create: jest.fn(),
      issueLatest: jest.fn(),
      deleteById: jest.fn(),
      deleteManyByEmailAndType: jest.fn(),
    };
    passwordResetTransaction = {
      complete: jest.fn(),
    };
    passwordHasher = {
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
    };
    oneTimeToken = {
      create: jest.fn(),
      hash: jest.fn().mockReturnValue('token-hash'),
    };

    useCase = new ResetPasswordUseCase(
      verificationTokenRepo,
      passwordResetTransaction,
      passwordHasher,
      oneTimeToken,
    );
  });

  it('should_reset_password_and_revoke_all_sessions_when_token_is_valid', async () => {
    verificationTokenRepo.findByToken.mockResolvedValue(validResetToken);
    passwordHasher.hashPassword.mockResolvedValue('new_hash');
    passwordResetTransaction.complete.mockResolvedValue(true);

    await useCase.execute({ token: 'valid-token', newPassword: 'new-pwd' });

    expect(passwordHasher.hashPassword).toHaveBeenCalledWith('new-pwd');
    expect(passwordResetTransaction.complete).toHaveBeenCalledWith({
      tokenId: 'token-1',
      tokenHash: 'token-hash',
      email: 'test@example.com',
      hashedPassword: 'new_hash',
      now: expect.any(Date),
    });
  });

  it('should_reject_password_reset_when_token_is_unknown', async () => {
    verificationTokenRepo.findByToken.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'bad', newPassword: 'pwd' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should_reject_password_reset_when_token_type_is_wrong', async () => {
    verificationTokenRepo.findByToken.mockResolvedValue({
      ...validResetToken,
      type: AuthTokenType.EMAIL_VERIFICATION,
    });

    await expect(useCase.execute({ token: 'bad', newPassword: 'pwd' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should_reject_password_reset_when_token_is_expired', async () => {
    verificationTokenRepo.findByToken.mockResolvedValue({
      ...validResetToken,
      expires: new Date(Date.now() - 10_000),
    });

    await expect(useCase.execute({ token: 'bad', newPassword: 'pwd' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should_reject_password_reset_when_token_was_consumed_concurrently', async () => {
    verificationTokenRepo.findByToken.mockResolvedValue(validResetToken);
    passwordHasher.hashPassword.mockResolvedValue('new_hash');
    passwordResetTransaction.complete.mockResolvedValue(false);

    await expect(useCase.execute({ token: 'valid-token', newPassword: 'new-pwd' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
