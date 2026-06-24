export interface CreateUserData {
  email: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  emailVerified?: Date | null;
}

export interface UserModel {
  id: string;
  email: string;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  emailVerified: Date | null;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserModel | null>;
  findById(id: string): Promise<UserModel | null>;
  create(data: CreateUserData): Promise<UserModel>;
  updateEmailVerified(email: string, date: Date): Promise<UserModel>;
  updatePassword(email: string, hashedPassword: string): Promise<UserModel>;
}
