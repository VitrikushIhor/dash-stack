import { Module } from '@nestjs/common';
import { MeController } from './presentation/controllers/me.controller';
import { OrganizationModule } from '../organization/organization.module';
import { AuthModule } from '../auth/auth.module';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';

@Module({
  imports: [OrganizationModule, AuthModule],
  controllers: [MeController],
  providers: [GetCurrentUserUseCase],
  exports: [GetCurrentUserUseCase],
})
export class UserModule {}
