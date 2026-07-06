import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole } from '../auth/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { 
    create: jest.Mock; 
    findAll: jest.Mock; 
    findOne: jest.Mock; 
    update: jest.Mock; 
    remove: jest.Mock 
  };

  const mockUser = {
    id: 'uuid-user',
    email: 'test@test.com',
    firstName: 'Test',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a UsersService.create y retornar el usuario creado', async () => {
      const dto: CreateUserDto = { 
        email: 'test@test.com', 
        password: 'pass', 
        firstName: 'Test', 
        lastName: 'User' 
      };
      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('debería llamar a UsersService.findAll y retornar los datos paginados', async () => {
      const expectedResponse = { data: [mockUser], total: 1, page: 1, limit: 10 };
      usersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll('test', 1, 10, 'createdAt', 'asc');

      expect(usersService.findAll).toHaveBeenCalledWith('test', 1, 10, 'createdAt', 'asc');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('debería llamar a UsersService.findOne y retornar el usuario', async () => {
      usersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('uuid-user');

      expect(usersService.findOne).toHaveBeenCalledWith('uuid-user');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('debería llamar a UsersService.update y retornar el usuario actualizado', async () => {
      const dto: UpdateUserDto = { firstName: 'Updated' };
      usersService.update.mockResolvedValue({ ...mockUser, ...dto });

      const result = await controller.update('uuid-user', dto);

      expect(usersService.update).toHaveBeenCalledWith('uuid-user', dto);
      expect(result.firstName).toEqual('Updated');
    });
  });

  describe('remove', () => {
    it('debería llamar a UsersService.remove y retornar mensaje', async () => {
      const expectedResponse = { message: 'Usuario desactivado correctamente' };
      usersService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove('uuid-user');

      expect(usersService.remove).toHaveBeenCalledWith('uuid-user');
      expect(result).toEqual(expectedResponse);
    });
  });
});
