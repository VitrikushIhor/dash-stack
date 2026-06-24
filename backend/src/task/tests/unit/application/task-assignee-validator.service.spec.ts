import { TaskAssigneeValidatorService } from '../../../application/services/task-assignee-validator.service';
import { MembershipRepositoryPort } from '../../../application/ports/membership.repository.port';
import { InvalidAssigneesException } from '../../../domain/exceptions/invalid-assignees.exception';

describe('TaskAssigneeValidatorService', () => {
  let service: TaskAssigneeValidatorService;
  let membershipRepository: jest.Mocked<MembershipRepositoryPort>;

  beforeEach(() => {
    membershipRepository = {
      validateMemberships: jest.fn(),
    };
    service = new TaskAssigneeValidatorService(membershipRepository);
  });

  it('should pass if assigneeIds is undefined', async () => {
    await expect(
      service.validateOrThrow('org-1', undefined),
    ).resolves.not.toThrow();
    expect(membershipRepository.validateMemberships).not.toHaveBeenCalled();
  });

  it('should pass if assigneeIds is empty', async () => {
    await expect(service.validateOrThrow('org-1', [])).resolves.not.toThrow();
    expect(membershipRepository.validateMemberships).not.toHaveBeenCalled();
  });

  it('should pass if memberships are valid', async () => {
    membershipRepository.validateMemberships.mockResolvedValue(true);

    await expect(
      service.validateOrThrow('org-1', ['user-1', 'user-2']),
    ).resolves.not.toThrow();

    expect(membershipRepository.validateMemberships).toHaveBeenCalledWith(
      'org-1',
      ['user-1', 'user-2'],
    );
  });

  it('should throw InvalidAssigneesException if memberships are invalid', async () => {
    membershipRepository.validateMemberships.mockResolvedValue(false);

    await expect(
      service.validateOrThrow('org-1', ['user-1', 'invalid-user']),
    ).rejects.toThrow(InvalidAssigneesException);

    expect(membershipRepository.validateMemberships).toHaveBeenCalledWith(
      'org-1',
      ['user-1', 'invalid-user'],
    );
  });
});
