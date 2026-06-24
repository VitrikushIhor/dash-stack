import { OrganizationSlug } from '../../../domain/value-objects/organization-slug.vo';

describe('OrganizationSlug', () => {
  describe('fromName()', () => {
    it('converts name to lowercase slug', () => {
      const slug = OrganizationSlug.fromName('My Organization');
      expect(slug.value).toBe('my-organization');
    });

    it('replaces multiple spaces with single dash', () => {
      const slug = OrganizationSlug.fromName('Hello   World');
      expect(slug.value).toBe('hello-world');
    });

    it('strips special characters', () => {
      const slug = OrganizationSlug.fromName('Org! @#$% Name');
      expect(slug.value).toBe('org-name');
    });

    it('handles single word', () => {
      const slug = OrganizationSlug.fromName('Acme');
      expect(slug.value).toBe('acme');
    });

    it('handles already lowercase input', () => {
      const slug = OrganizationSlug.fromName('acme corp');
      expect(slug.value).toBe('acme-corp');
    });
  });

  describe('from()', () => {
    it('wraps an existing slug value as-is', () => {
      const slug = OrganizationSlug.from('existing-slug');
      expect(slug.value).toBe('existing-slug');
    });
  });

  describe('withSuffix()', () => {
    it('appends counter suffix', () => {
      const base = OrganizationSlug.fromName('Acme');
      const suffixed = base.withSuffix(2);
      expect(suffixed.value).toBe('acme-2');
    });

    it('creates a new instance (immutable)', () => {
      const base = OrganizationSlug.fromName('Acme');
      const suffixed = base.withSuffix(1);
      expect(base.value).toBe('acme');
      expect(suffixed.value).toBe('acme-1');
    });
  });
});
