import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';
import { UsersController } from './users.controller';

@Module({
  imports: [],
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
})
export class UsersModule {}
