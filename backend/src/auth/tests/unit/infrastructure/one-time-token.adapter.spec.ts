import { OneTimeTokenAdapter } from '../../../infrastructure/security/one-time-token.adapter';

describe('OneTimeTokenAdapter', () => {
  const adapter = new OneTimeTokenAdapter();

  it('should create a high-entropy raw token and store-safe digest', () => {
    const token = adapter.create();

    expect(token.raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(token.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(token.hash).not.toBe(token.raw);
    expect(adapter.hash(token.raw)).toBe(token.hash);
  });
});
