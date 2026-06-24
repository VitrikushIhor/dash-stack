import { Inject, Injectable } from '@nestjs/common';
import {
  UserRepositoryPort,
  UserModel,
} from '../../ports/outgoing/user.repository.port';

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<UserModel | null> {
    return this.userRepo.findById(userId);
  }
}
