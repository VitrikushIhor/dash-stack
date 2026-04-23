import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { InvitationRepository } from '../repositories/invitation.repository';

@Injectable()
export class InvitationService {
  constructor(
    private readonly repository: InvitationRepository,
    private readonly emailService: EmailService,
  ) {}

  async sendInvite(orgId: string, invitedBy: string, dto: CreateInvitationDto) {
    const { email, role } = dto;

    const existingMember = await this.repository.findByEmailAndOrg(
      email,
      orgId,
    );
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const org = await this.repository.findOrgById(orgId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.repository.create({
      email,
      role,
      orgId,
      invitedBy,
      expiresAt,
    });

    await this.emailService.sendInviteEmail(email, invitation.token, org.name);

    return invitation;
  }

  async acceptInvite(token: string, userId: string) {
    const invitation = await this.repository.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation expired');
    }

    return this.repository.accept(
      invitation.id,
      userId,
      invitation.orgId,
      invitation.role,
    );
  }

  async listPending(orgId: string) {
    return this.repository.listPending(orgId);
  }

  async revokeInvite(invitationId: string, orgId: string) {
    const invitation = await this.repository.findById(invitationId);

    if (!invitation || invitation.orgId !== orgId) {
      throw new NotFoundException('Invitation not found in this organization');
    }

    return this.repository.delete(invitationId);
  }
}
