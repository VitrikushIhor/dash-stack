import { Module } from '@nestjs/common';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './invitation.controller';
import { EmailModule } from '../email/email.module';
import { InvitationRepository } from './repositories/invitation.repository';

@Module({
  imports: [EmailModule],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository],
  exports: [InvitationService],
})
export class InvitationModule {}
