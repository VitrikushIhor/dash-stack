import { validateAuthEnvironment } from './auth-environment.validator';

describe('Auth environment validation', () => {
  const productionEnvironment = () => ({
    NODE_ENV: 'production',
    JWT_ACCESS_SECRET: 'a'.repeat(48),
    JWT_ACCESS_EXPIRATION: '15m',
    JWT_REFRESH_EXPIRATION: '7d',
    FRONTEND_URL: 'https://app.example.com',
    CORS_ORIGINS: 'https://app.example.com',
    DATABASE_URL: 'postgresql://app:strong-password@db.internal:5432/app?schema=public',
    SMTP_HOST: 'smtp.mail.internal',
    SMTP_PORT: '587',
    SMTP_USER: 'mailer@company.test',
    SMTP_PASS: 'secure-mailer-credential',
    STORAGE_PROVIDER: 's3',
    AWS_S3_BUCKET: 'dashstack-public-assets',
    AWS_PRIVATE_S3_BUCKET: 'dashstack-private-attachments',
    AWS_S3_REGION: 'eu-central-1',
    AWS_ACCESS_KEY_ID: 'AKIATESTCREDENTIAL123',
    AWS_SECRET_ACCESS_KEY: 'secure-aws-credential-value',
    AWS_CLOUDFRONT_DOMAIN: 'cdn.company.test',
  });

  it('should_accept_explicit_production_auth_configuration', () => {
    const environment = productionEnvironment();

    expect(validateAuthEnvironment(environment)).toBe(environment);
  });

  it.each([
    ['missing secret', { JWT_ACCESS_SECRET: undefined }],
    ['short secret', { JWT_ACCESS_SECRET: 'short' }],
    ['placeholder secret', { JWT_ACCESS_SECRET: 'change-me-please'.repeat(4) }],
    ['missing access TTL', { JWT_ACCESS_EXPIRATION: undefined }],
    ['invalid refresh TTL', { JWT_REFRESH_EXPIRATION: 'forever' }],
    ['excessive access TTL', { JWT_ACCESS_EXPIRATION: '365d' }],
    ['excessive refresh TTL', { JWT_REFRESH_EXPIRATION: '365d' }],
    ['frontend origin absent from CORS', { CORS_ORIGINS: 'https://other.example.com' }],
    ['missing CORS origins', { CORS_ORIGINS: undefined }],
    ['insecure CORS origin', { CORS_ORIGINS: 'http://app.example.com' }],
    ['CORS path', { CORS_ORIGINS: 'https://app.example.com/path' }],
    ['missing frontend URL', { FRONTEND_URL: undefined }],
    ['missing database URL', { DATABASE_URL: undefined }],
    ['invalid database URL', { DATABASE_URL: 'https://db.example.test' }],
    ['missing SMTP user', { SMTP_USER: undefined }],
    ['placeholder SMTP password', { SMTP_PASS: 'testpass' }],
    ['invalid SMTP port', { SMTP_PORT: '587junk' }],
    ['unknown storage provider', { STORAGE_PROVIDER: 'none' }],
    ['local storage in production', { STORAGE_PROVIDER: 'local' }],
    ['missing private bucket', { AWS_PRIVATE_S3_BUCKET: undefined }],
    ['shared public/private bucket', { AWS_PRIVATE_S3_BUCKET: 'dashstack-public-assets' }],
    ['placeholder AWS key', { AWS_ACCESS_KEY_ID: 'your-access-key-id' }],
    ['invalid CDN domain', { AWS_CLOUDFRONT_DOMAIN: 'https://cdn.company.test/files' }],
    ['partial Auth0 credentials', { AUTH0_DOMAIN: 'tenant.auth0.com' }],
    [
      'insecure Auth0 domain',
      {
        AUTH0_DOMAIN: 'http://localhost:9000',
        AUTH0_CLIENT_ID: 'client-123',
        AUTH0_CLIENT_SECRET: 'strong-auth0-secret',
      },
    ],
    [
      'mismatched public Auth0 domain',
      {
        AUTH0_DOMAIN: 'tenant.auth0.com',
        NEXT_PUBLIC_AUTH0_DOMAIN: 'other.auth0.com',
        AUTH0_CLIENT_ID: 'client-123',
        AUTH0_CLIENT_SECRET: 'strong-auth0-secret',
      },
    ],
  ])('should_reject_%s_in_production', (_caseName, override) => {
    const environment = { ...productionEnvironment(), ...override };

    expect(() => validateAuthEnvironment(environment)).toThrow(
      'Invalid production auth configuration',
    );
  });

  it('should_accept_complete_optional_auth0_configuration', () => {
    const environment = {
      ...productionEnvironment(),
      AUTH0_DOMAIN: 'tenant.auth0.com',
      AUTH0_CLIENT_ID: 'client-123',
      AUTH0_CLIENT_SECRET: 'strong-auth0-secret',
      NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
    };

    expect(validateAuthEnvironment(environment)).toBe(environment);
  });

  it('should_not_put_secret_value_in_validation_error', () => {
    const secret = 'change-me-please'.repeat(4);

    expect(() =>
      validateAuthEnvironment({ ...productionEnvironment(), JWT_ACCESS_SECRET: secret }),
    ).toThrow(/^Invalid production auth configuration/);

    try {
      validateAuthEnvironment({ ...productionEnvironment(), JWT_ACCESS_SECRET: secret });
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });

  it('should_allow_local_test_configuration_without_production_credentials', () => {
    const environment = { NODE_ENV: 'test' };

    expect(validateAuthEnvironment(environment)).toBe(environment);
  });
});
