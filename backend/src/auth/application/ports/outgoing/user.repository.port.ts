export interface CreateUserData {
  email: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  emailVerified?: Date | null;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  emailVerified: Date | null;
}

export interface UserWithPassword extends UserSummary {
  password: string | null;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserSummary | null>;
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<UserSummary | null>;
  create(data: CreateUserData): Promise<UserSummary>;
  updateEmailVerified(email: string, date: Date): Promise<UserSummary>;
  updatePassword(email: string, hashedPassword: string): Promise<UserSummary>;
}
