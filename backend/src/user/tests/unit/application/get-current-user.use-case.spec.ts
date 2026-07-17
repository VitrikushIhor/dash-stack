import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UserRepositoryPort } from '../../../../auth/application/ports/outgoing/user.repository.port';
import { UserReadModel } from '../../../application/read-models/user.read-model';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserUseCase,
        {
          provide: 'UserRepositoryPort',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCurrentUserUseCase>(GetCurrentUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return UserReadModel when user is found', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    };

    userRepository.findById.mockResolvedValue(mockUser as any);

    const result = await useCase.execute('1');

    expect(userRepository.findById).toHaveBeenCalledWith('1');
    expect(result).toBeInstanceOf(UserReadModel);
    expect(result.id).toBe(mockUser.id);
    expect(result.email).toBe(mockUser.email);
    expect(result.firstName).toBe(mockUser.firstName);
    expect(result.lastName).toBe(mockUser.lastName);
    expect(result.avatar).toBe(mockUser.avatar);
  });

  it('should throw UserNotFoundException when user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toThrow(UserNotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith('1');
  });
});
