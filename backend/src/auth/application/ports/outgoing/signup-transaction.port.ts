import { CreateUserData } from './user.repository.port';
import { CreateVerificationTokenData } from './verification-token.repository.port';

export interface SignupTransactionPort {
  createPending(user: CreateUserData, token: CreateVerificationTokenData): Promise<boolean>;
}
