import { AuthTokenType } from '../../../domain/enums/token-type.enum';

export interface CreateVerificationTokenData {
  email: string;
  token: string;
  type: AuthTokenType;
  expires: Date;
}

export interface VerificationTokenModel {
  id: string;
  email: string;
  token: string;
  type: AuthTokenType;
  expires: Date;
}

export interface VerificationTokenRepositoryPort {
  findByToken(token: string): Promise<VerificationTokenModel | null>;
  create(data: CreateVerificationTokenData): Promise<VerificationTokenModel>;
  deleteById(id: string): Promise<VerificationTokenModel>;
  deleteManyByEmailAndType(
    email: string,
    type: AuthTokenType,
  ): Promise<{ count: number }>;
}
