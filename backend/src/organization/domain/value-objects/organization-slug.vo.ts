import { slugify } from '../../../common/utils/slugify.util';

export class OrganizationSlug {
  private constructor(public readonly value: string) {}

  static fromName(name: string): OrganizationSlug {
    return new OrganizationSlug(slugify(name));
  }

  static from(value: string): OrganizationSlug {
    return new OrganizationSlug(value);
  }

  withSuffix(counter: number): OrganizationSlug {
    return new OrganizationSlug(`${this.value}-${counter}`);
  }
}
