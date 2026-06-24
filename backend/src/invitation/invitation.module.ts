import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { InvitationController } from './presentation/controllers/invitation.controller';
import { InvitationAcceptController } from './presentation/controllers/invitation-accept.controller';
import { SendInviteUseCase } from './application/use-cases/send-invite.use-case';
import { AcceptInviteUseCase } from './application/use-cases/accept-invite.use-case';
import { RevokeInviteUseCase } from './application/use-cases/revoke-invite.use-case';
import { ListPendingInvitationsUseCase } from './application/use-cases/list-pending-invitations.use-case';
import { PrismaInvitationRepository } from './infrastructure/persistence/prisma-invitation.repository';
import { EmailInvitationMailerAdapter } from './infrastructure/integrations/email-invitation-mailer.adapter';

@Module({
  imports: [EmailModule],
  controllers: [InvitationController, InvitationAcceptController],
  providers: [
    SendInviteUseCase,
    AcceptInviteUseCase,
    RevokeInviteUseCase,
    ListPendingInvitationsUseCase,
    PrismaInvitationRepository,
    {
      provide: 'InvitationRepositoryPort',
      useExisting: PrismaInvitationRepository,
    },
    EmailInvitationMailerAdapter,
    {
      provide: 'InvitationMailerPort',
      useExisting: EmailInvitationMailerAdapter,
    },
  ],
  exports: [SendInviteUseCase, AcceptInviteUseCase],
})
export class InvitationModule {}
