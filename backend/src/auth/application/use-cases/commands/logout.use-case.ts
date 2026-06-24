import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { RefreshTokenRepositoryPort } from '../../ports/outgoing/refresh-token.repository.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
  ) {}

  async execute(refreshToken: string): Promise<{ message: string }> {
    const deleted = await this.refreshTokenRepo.deleteByToken(refreshToken);

    if (deleted.count === 0) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    return { message: AUTH_ERRORS.LOGOUT_SUCCESS };
  }
}
