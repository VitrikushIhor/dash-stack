import { FindOrganizationMembersUseCase } from '../../../application/use-cases/find-organization-members.use-case';
import { FindOrganizationMemberUseCase } from '../../../application/use-cases/find-organization-member.use-case';
import {
  OrganizationRepositoryPort,
  OrganizationMember,
} from '../../../application/ports/organization.port';
import { MemberNotFoundException } from '../../../domain/exceptions/member-not-found.exception';

const mockMember = (
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember => ({
  user: {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'John',
    avatar: '',
  },
  ...overrides,
});

const makeRepository = (): jest.Mocked<OrganizationRepositoryPort> => ({
  create: jest.fn(),
  findManyByUserId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOrganizationMembers: jest.fn(),
  findOrganizationMember: jest.fn(),
  existsBySlug: jest.fn(),
});

describe('FindOrganizationMembersUseCase', () => {
  let useCase: FindOrganizationMembersUseCase;
  let repository: jest.Mocked<OrganizationRepositoryPort>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new FindOrganizationMembersUseCase(repository);
  });

  it('returns list of members for organization', async () => {
    const expected = [
      mockMember(),
      mockMember({
        user: { id: 'user-2', email: 'b@b.com', firstName: 'Jane', avatar: '' },
      }),
    ];
    repository.findOrganizationMembers.mockResolvedValue(expected);

    const result = await useCase.execute('org-1');

    expect(result).toBe(expected);
    expect(repository.findOrganizationMembers).toHaveBeenCalledWith('org-1');
  });

  it('returns empty array when organization has no members', async () => {
    repository.findOrganizationMembers.mockResolvedValue([]);

    const result = await useCase.execute('org-empty');

    expect(result).toEqual([]);
  });
});

describe('FindOrganizationMemberUseCase', () => {
  let useCase: FindOrganizationMemberUseCase;
  let repository: jest.Mocked<OrganizationRepositoryPort>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new FindOrganizationMemberUseCase(repository);
  });

  it('returns member when found', async () => {
    const expected = mockMember();
    repository.findOrganizationMember.mockResolvedValue(expected);

    const result = await useCase.execute('org-1', 'user-1');

    expect(result).toBe(expected);
    expect(repository.findOrganizationMember).toHaveBeenCalledWith(
      'org-1',
      'user-1',
    );
  });

  it('throws MemberNotFoundException when member not found', async () => {
    repository.findOrganizationMember.mockResolvedValue(null);

    await expect(useCase.execute('org-1', 'user-999')).rejects.toThrow(
      MemberNotFoundException,
    );
  });

  it('exception message contains both orgId and userId', async () => {
    repository.findOrganizationMember.mockResolvedValue(null);

    await expect(useCase.execute('org-1', 'user-999')).rejects.toThrow(
      /user-999/,
    );
  });
});
