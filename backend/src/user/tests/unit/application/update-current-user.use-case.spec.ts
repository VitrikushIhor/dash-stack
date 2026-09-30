import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCurrentUserUseCase } from '../../../application/use-cases/update-current-user.use-case';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UserRepositoryPort } from '../../../../auth/application/ports/outgoing/user.repository.port';
import { UserReadModel } from '../../../application/read-models/user.read-model';

describe('UpdateCurrentUserUseCase', () => {
  let useCase: UpdateCurrentUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCurrentUserUseCase,
        {
          provide: 'UserRepositoryPort',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCurrentUserUseCase>(UpdateCurrentUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return updated UserReadModel when user is updated successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      dob: null,
      bio: null,
      urls: [],
    };

    const updateCommand = {
      userId: '1',
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'New bio',
      urls: ['https://example.com'],
    };

    const mockUpdatedUser = {
      ...mockUser,
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'New bio',
      urls: ['https://example.com'],
    };

    userRepository.findById.mockResolvedValue(mockUser as any);
    userRepository.updateProfile.mockResolvedValue(mockUpdatedUser as any);

    const result = await useCase.execute(updateCommand);

    expect(userRepository.findById).toHaveBeenCalledWith('1');
    expect(userRepository.updateProfile).toHaveBeenCalledWith('1', {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'New bio',
      urls: ['https://example.com'],
    });

    expect(result).toBeInstanceOf(UserReadModel);
    expect(result.id).toBe(mockUpdatedUser.id);
    expect(result.firstName).toBe('Updated');
    expect(result.lastName).toBe('Name');
    expect(result.bio).toBe('New bio');
    expect(result.urls).toEqual(['https://example.com']);
  });

  it('should_preserve_omitted_profile_fields_when_only_first_name_changes', async () => {
    const original = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Before',
      lastName: 'Tester',
      avatar: 'avatars/existing.webp',
      dob: new Date('1990-01-01'),
      bio: 'Existing bio',
      urls: ['https://example.com'],
      emailVerified: new Date(),
    };
    userRepository.findById.mockResolvedValue(original);
    userRepository.updateProfile.mockResolvedValue({ ...original, firstName: 'After' });

    await useCase.execute({ userId: '1', firstName: 'After' });

    expect(userRepository.updateProfile).toHaveBeenCalledWith('1', {
      firstName: 'After',
    });
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'invalid-id' })).rejects.toThrow(UserNotFoundException);

    expect(userRepository.findById).toHaveBeenCalledWith('invalid-id');
    expect(userRepository.updateProfile).not.toHaveBeenCalled();
  });
});
