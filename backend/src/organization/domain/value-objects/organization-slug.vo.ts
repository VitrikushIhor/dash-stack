export class OrganizationSlug {
  private constructor(public readonly value: string) {}

  static fromName(name: string): OrganizationSlug {
    const slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    return new OrganizationSlug(slug);
  }

  static from(value: string): OrganizationSlug {
    return new OrganizationSlug(value);
  }

  withSuffix(counter: number): OrganizationSlug {
    return new OrganizationSlug(`${this.value}-${counter}`);
  }
}
