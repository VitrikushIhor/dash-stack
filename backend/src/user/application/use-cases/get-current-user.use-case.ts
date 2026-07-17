import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../../auth/application/ports/outgoing/user.repository.port';
import { UserReadModel } from '../read-models/user.read-model';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<UserReadModel> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return UserReadModel.fromSummary(user);
  }
}
