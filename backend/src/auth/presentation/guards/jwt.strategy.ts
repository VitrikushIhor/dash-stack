import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../common/exceptions/domain.exception';
import { ConfigService } from '@nestjs/config';
import { ValidateUserUseCase } from '../../application/use-cases/queries/validate-user.use-case';
import { JwtPayload } from '../../shared/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly validateUserUseCase: ValidateUserUseCase,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.validateUserUseCase.execute(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
