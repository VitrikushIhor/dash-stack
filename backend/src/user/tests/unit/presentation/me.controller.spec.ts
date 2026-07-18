import { Test, TestingModule } from '@nestjs/testing';
import { MeController } from '../../../presentation/controllers/me.controller';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { UpdateCurrentUserUseCase } from '../../../application/use-cases/update-current-user.use-case';
import { FindUserMembershipsUseCase } from '../../../../organization/application/use-cases/find-user-memberships.use-case';

describe('MeController', () => {
  let controller: MeController;
  let getCurrentUserUseCase: jest.Mocked<GetCurrentUserUseCase>;
  let updateCurrentUserUseCase: jest.Mocked<UpdateCurrentUserUseCase>;
  let findUserMembershipsUseCase: jest.Mocked<FindUserMembershipsUseCase>;

  beforeEach(async () => {
    getCurrentUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCurrentUserUseCase>;

    updateCurrentUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateCurrentUserUseCase>;

    findUserMembershipsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindUserMembershipsUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      providers: [
        {
          provide: GetCurrentUserUseCase,
          useValue: getCurrentUserUseCase,
        },
        {
          provide: UpdateCurrentUserUseCase,
          useValue: updateCurrentUserUseCase,
        },
        {
          provide: FindUserMembershipsUseCase,
          useValue: findUserMembershipsUseCase,
        },
      ],
    }).compile();

    controller = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('me', () => {
    it('should return current user', async () => {
      const req = { user: { id: 'user-1' } };
      const expectedResult = { id: 'user-1', email: 'test@test.com' };
      getCurrentUserUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.me(req);

      expect(getCurrentUserUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMemberships', () => {
    it('should return user memberships', async () => {
      const req = { user: { id: 'user-1' } };
      const expectedResult = [{ id: 'org-1', name: 'Org 1' }];
      findUserMembershipsUseCase.execute.mockResolvedValue(
        expectedResult as any,
      );

      const result = await controller.getMemberships(req);

      expect(findUserMembershipsUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const req = { user: { id: 'user-1' } };
      const dto = { firstName: 'Updated' };
      const expectedResult = { id: 'user-1', firstName: 'Updated' };
      updateCurrentUserUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.updateProfile(req, dto);

      expect(updateCurrentUserUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        ...dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
