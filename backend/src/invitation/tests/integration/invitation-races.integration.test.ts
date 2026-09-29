import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { OrgRole } from '../../../organization/domain/enums/org-role.enum';
import { AcceptInviteUseCase } from '../../application/use-cases/accept-invite.use-case';
import { RevokeInviteUseCase } from '../../application/use-cases/revoke-invite.use-case';
import { PrismaInvitationRepository } from '../../infrastructure/persistence/prisma-invitation.repository';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for invitation integration tests');

describe('Invitation PostgreSQL races', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let repository: PrismaInvitationRepository;
  let accept: AcceptInviteUseCase;
  let revoke: RevokeInviteUseCase;
  let userId: string;
  let orgId: string;
  let email: string;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    repository = new PrismaInvitationRepository(prisma);
    accept = new AcceptInviteUseCase(repository);
    revoke = new RevokeInviteUseCase(repository);
  });

  beforeEach(async () => {
    const suffix = randomUUID();
    email = `invitation-race-${suffix}@example.test`;
    const user = await prisma.user.create({ data: { email } });
    const organization = await prisma.organization.create({
      data: { name: 'Invitation race test', slug: `invitation-race-${suffix}` },
    });
    userId = user.id;
    orgId = organization.id;
  });

  afterEach(async () => {
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  async function createInvitation() {
    return repository.create({
      email,
      orgId,
      role: OrgRole.MEMBER,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 60_000),
    });
  }

  it('should_grant_membership_once_when_two_accept_requests_race', async () => {
    const invitation = await createInvitation();
    const command = { token: invitation.token, userId, userEmail: email };

    const outcomes = await Promise.allSettled([accept.execute(command), accept.execute(command)]);

    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.membership.count({ where: { userId, orgId } })).toBe(1);
    expect(
      (await prisma.invitation.findUnique({ where: { id: invitation.invitation.id } }))?.acceptedAt,
    ).not.toBeNull();
  });

  it('should_never_report_both_accept_and_revoke_success_when_they_race', async () => {
    const invitation = await createInvitation();

    const outcomes = await Promise.allSettled([
      accept.execute({ token: invitation.token, userId, userEmail: email }),
      revoke.execute(invitation.invitation.id, orgId),
    ]);
    const accepted = outcomes[0]?.status === 'fulfilled';
    const revoked = outcomes[1]?.status === 'fulfilled';
    const stored = await prisma.invitation.findUnique({
      where: { id: invitation.invitation.id },
    });
    const membershipCount = await prisma.membership.count({ where: { userId, orgId } });

    expect(Number(accepted) + Number(revoked)).toBe(1);
    expect(membershipCount).toBe(accepted ? 1 : 0);
    expect(stored === null).toBe(revoked);
    if (accepted) expect(stored?.acceptedAt).not.toBeNull();
  });

  it('should_rollback_consumption_when_membership_insert_fails', async () => {
    const invitation = await createInvitation();

    await expect(
      repository.accept(
        invitation.invitation.id,
        `missing-${randomUUID()}`,
        email,
        orgId,
        OrgRole.MEMBER,
      ),
    ).rejects.toThrow();

    expect(
      (await prisma.invitation.findUnique({ where: { id: invitation.invitation.id } }))?.acceptedAt,
    ).toBeNull();
    expect(await prisma.membership.count({ where: { orgId } })).toBe(0);

    await accept.execute({ token: invitation.token, userId, userEmail: email });
    expect(await prisma.membership.count({ where: { userId, orgId } })).toBe(1);
  });
});
