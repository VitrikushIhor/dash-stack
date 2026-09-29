import { validate } from 'class-validator';
import { LoginDto } from '../../../presentation/dto/login.dto';
import { ResetPasswordDto } from '../../../presentation/dto/reset-password.dto';
import { SignupDto } from '../../../presentation/dto/signup.dto';

describe('password DTO byte limit', () => {
  it.each([
    ['signup', Object.assign(new SignupDto(), { email: 'user@example.com' })],
    ['login', Object.assign(new LoginDto(), { email: 'user@example.com' })],
    ['reset', Object.assign(new ResetPasswordDto(), { token: 'reset-token' })],
  ])('should reject passwords over 72 UTF-8 bytes for %s', async (_name, dto) => {
    dto.password = 'é'.repeat(37);

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'password',
          constraints: expect.objectContaining({
            isBcryptPassword: 'Password must not exceed 72 bytes when encoded as UTF-8',
          }),
        }),
      ]),
    );
  });

  it('should accept a password containing exactly 72 UTF-8 bytes', async () => {
    const dto = Object.assign(new SignupDto(), {
      email: 'user@example.com',
      password: 'é'.repeat(36),
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });
});
