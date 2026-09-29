type Environment = Record<string, unknown>;

const TTL_UNIT_MILLISECONDS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

const ACCESS_TTL_LIMIT = 15 * 60_000;
const REFRESH_TTL_LIMIT = 30 * 86_400_000;

function isValidTtl(value: unknown, maxMilliseconds: number): boolean {
  if (typeof value !== 'string') return false;

  const match = /^([1-9]\d*)([smhd])$/.exec(value);
  if (!match) return false;
  const unitMilliseconds = TTL_UNIT_MILLISECONDS[match[2]];
  const milliseconds = Number(match[1]) * unitMilliseconds;
  return Number.isSafeInteger(milliseconds) && milliseconds <= maxMilliseconds;
}

function isTrustedOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);

    return (
      value === url.origin &&
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' || (isLoopback && url.protocol === 'http:'))
    );
  } catch {
    return false;
  }
}

function isConfiguredValue(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !/(change.?me|placeholder|your[_-]|^testpass$|^app_password$)/i.test(value)
  );
}

function isDatabaseUrl(value: unknown): boolean {
  if (!isConfiguredValue(value)) return false;
  try {
    const url = new URL(value);
    return (
      ['postgresql:', 'postgres:'].includes(url.protocol) &&
      Boolean(url.hostname && url.pathname !== '/' && url.username && url.password)
    );
  } catch {
    return false;
  }
}

function isHostname(value: unknown): boolean {
  return (
    isConfiguredValue(value) &&
    value.length <= 253 &&
    /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])$/i.test(value) &&
    !value.includes('..')
  );
}

function isValidS3Configuration(environment: Environment): boolean {
  if (environment.STORAGE_PROVIDER !== 's3') return false;

  const publicBucket = environment.AWS_S3_BUCKET;
  const privateBucket = environment.AWS_PRIVATE_S3_BUCKET;
  return (
    isHostname(publicBucket) &&
    isHostname(privateBucket) &&
    publicBucket !== privateBucket &&
    isConfiguredValue(environment.AWS_S3_REGION) &&
    isConfiguredValue(environment.AWS_ACCESS_KEY_ID) &&
    isConfiguredValue(environment.AWS_SECRET_ACCESS_KEY) &&
    isHostname(environment.AWS_CLOUDFRONT_DOMAIN)
  );
}

function isValidAuth0Configuration(environment: Environment): boolean {
  const domain = environment.AUTH0_DOMAIN;
  const clientId = environment.AUTH0_CLIENT_ID;
  const clientSecret = environment.AUTH0_CLIENT_SECRET;
  const publicDomain = environment.NEXT_PUBLIC_AUTH0_DOMAIN;
  const configured = [domain, clientId, clientSecret, publicDomain].some(
    (value) => value !== undefined && value !== '',
  );

  if (!configured) return true;
  return (
    isHostname(domain) &&
    isConfiguredValue(clientId) &&
    isConfiguredValue(clientSecret) &&
    (publicDomain === undefined || publicDomain === domain)
  );
}

function hasValidJwtConfiguration(environment: Environment): boolean {
  const secret = environment.JWT_ACCESS_SECRET;

  return (
    typeof secret === 'string' &&
    secret.length >= 32 &&
    !/(change.?me|example|placeholder|your[_-])/i.test(secret) &&
    isValidTtl(environment.JWT_ACCESS_EXPIRATION, ACCESS_TTL_LIMIT) &&
    isValidTtl(environment.JWT_REFRESH_EXPIRATION, REFRESH_TTL_LIMIT)
  );
}

function hasValidOriginConfiguration(environment: Environment): boolean {
  const frontendUrl = environment.FRONTEND_URL;
  const corsOrigins = environment.CORS_ORIGINS;

  if (typeof frontendUrl !== 'string' || !isTrustedOrigin(frontendUrl)) return false;
  if (typeof corsOrigins !== 'string' || corsOrigins.length === 0) return false;

  const origins = corsOrigins.split(',').map((origin) => origin.trim());
  return origins.every(isTrustedOrigin) && origins.includes(frontendUrl);
}

function hasValidSmtpConfiguration(environment: Environment): boolean {
  const port = Number(environment.SMTP_PORT);

  return (
    isHostname(environment.SMTP_HOST) &&
    Number.isInteger(port) &&
    port >= 1 &&
    port <= 65535 &&
    isConfiguredValue(environment.SMTP_USER) &&
    isConfiguredValue(environment.SMTP_PASS)
  );
}

export function validateAuthEnvironment(environment: Environment): Environment {
  if (environment.NODE_ENV !== 'production') return environment;

  if (
    !hasValidJwtConfiguration(environment) ||
    !hasValidOriginConfiguration(environment) ||
    !isDatabaseUrl(environment.DATABASE_URL) ||
    !hasValidSmtpConfiguration(environment) ||
    !isValidS3Configuration(environment) ||
    !isValidAuth0Configuration(environment)
  ) {
    throw new Error('Invalid production auth configuration');
  }

  return environment;
}
