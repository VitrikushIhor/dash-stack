import { ValidationOptions, ValidateBy } from 'class-validator';

export const BCRYPT_PASSWORD_MAX_BYTES = 72;
export const BCRYPT_PASSWORD_MAX_BYTES_MESSAGE =
  'Password must not exceed 72 bytes when encoded as UTF-8';

export function IsBcryptPassword(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isBcryptPassword',
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            Buffer.byteLength(value, 'utf8') <= BCRYPT_PASSWORD_MAX_BYTES
          );
        },
        defaultMessage: () => BCRYPT_PASSWORD_MAX_BYTES_MESSAGE,
      },
    },
    validationOptions,
  );
}
