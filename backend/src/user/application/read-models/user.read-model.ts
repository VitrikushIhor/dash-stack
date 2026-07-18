export class UserReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly avatar: string | null,
    public readonly dob: Date | null,
    public readonly bio: string | null,
    public readonly urls: string[],
  ) {}

  static fromSummary(user: any): UserReadModel {
    return new UserReadModel(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.avatar,
      user.dob || null,
      user.bio || null,
      user.urls || [],
    );
  }
}
