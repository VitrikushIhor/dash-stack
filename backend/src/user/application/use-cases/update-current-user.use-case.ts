import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../../auth/application/ports/outgoing/user.repository.port';
import { UserReadModel } from '../read-models/user.read-model';
import { UpdateCurrentUserCommand } from '../commands/update-current-user.command';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class UpdateCurrentUserUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: UpdateCurrentUserCommand): Promise<UserReadModel> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const updatedUser = await this.userRepo.updateProfile(command.userId, {
      email: command.email,
      firstName: command.firstName ?? null,
      lastName: command.lastName ?? null,
      dob: command.dob ? new Date(command.dob) : null,
      bio: command.bio ?? null,
      urls: command.urls ?? null,
      avatar: command.avatar ?? null,
    });

    return UserReadModel.fromSummary(updatedUser);
  }
}
