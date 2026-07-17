import { Inject, Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../read-models/pending-invitation.read-model';

@Injectable()
export class ListPendingInvitationsUseCase {
  constructor(
    @Inject('InvitationRepositoryPort')
    private readonly repository: InvitationRepositoryPort,
  ) {}

  async execute(orgId: string): Promise<PendingInvitationReadModel[]> {
    return this.repository.listPending(orgId);
  }
}
