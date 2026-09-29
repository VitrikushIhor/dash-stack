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

    const changes: Parameters<UserRepositoryPort['updateProfile']>[1] = {};
    if (command.firstName !== undefined) changes.firstName = command.firstName;
    if (command.lastName !== undefined) changes.lastName = command.lastName;
    if (command.dob !== undefined) changes.dob = command.dob ? new Date(command.dob) : null;
    if (command.bio !== undefined) changes.bio = command.bio;
    if (command.urls !== undefined) changes.urls = command.urls;
    if (command.avatar !== undefined) changes.avatar = command.avatar;

    const updatedUser = await this.userRepo.updateProfile(command.userId, changes);

    return UserReadModel.fromSummary(updatedUser);
  }
}
