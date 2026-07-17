import { InvitationEmail } from '../../../domain/value-objects/invitation-email.vo';

describe('InvitationEmail', () => {
  describe('constructor', () => {
    it('normalizes email to lowercase', () => {
      const email = new InvitationEmail('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('trims whitespace', () => {
      const email = new InvitationEmail('  user@example.com  ');
      expect(email.value).toBe('user@example.com');
    });

    it('trims and lowercases combined', () => {
      const email = new InvitationEmail('  User@Example.COM  ');
      expect(email.value).toBe('user@example.com');
    });

    it('handles already normalized email', () => {
      const email = new InvitationEmail('user@example.com');
      expect(email.value).toBe('user@example.com');
    });
  });

  describe('equals()', () => {
    it('returns true for same email', () => {
      const email = new InvitationEmail('user@example.com');
      expect(email.equals('user@example.com')).toBe(true);
    });

    it('returns true for case-different email', () => {
      const email = new InvitationEmail('user@example.com');
      expect(email.equals('USER@EXAMPLE.COM')).toBe(true);
    });

    it('returns true for whitespace-padded email', () => {
      const email = new InvitationEmail('user@example.com');
      expect(email.equals('  user@example.com  ')).toBe(true);
    });

    it('returns false for different email', () => {
      const email = new InvitationEmail('user@example.com');
      expect(email.equals('other@example.com')).toBe(false);
    });
  });
});
