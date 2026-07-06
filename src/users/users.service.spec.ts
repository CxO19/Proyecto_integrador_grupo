import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from '../auth/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: { findOne: jest.Mock; findAndCount: jest.Mock; save: jest.Mock };

  const mockUser: User = {
    id: 'uuid-user',
    email: 'test@test.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'new@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.USER,
    };

    it('debería crear un usuario nuevo si el email no existe', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed' as never);
      usersRepo.save.mockImplementation((user) => Promise.resolve({ ...mockUser, ...user }));

      const result = await service.create(dto);

      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersRepo.save).toHaveBeenCalled();
      expect(result.email).toEqual(dto.email);
      expect(result.password).toEqual('new-hashed');
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(usersRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería devolver usuarios paginados', async () => {
      usersRepo.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll();

      expect(usersRepo.findAndCount).toHaveBeenCalled();
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toEqual(1);
    });

    it('debería aplicar parámetros de búsqueda', async () => {
      usersRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('test', 2, 5, 'email', 'desc');

      expect(usersRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        skip: 5,
        take: 5,
        order: { email: 'DESC' },
      }));
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario existente', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-user');
      expect(usersRepo.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si el usuario no se encuentra', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const dto: UpdateUserDto = { firstName: 'Updated' };

    it('debería actualizar el usuario si existe', async () => {
      usersRepo.findOne.mockResolvedValue({ ...mockUser });
      usersRepo.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.update('uuid-user', dto);
      
      expect(usersRepo.save).toHaveBeenCalled();
      expect(result.firstName).toEqual('Updated');
    });

    it('debería lanzar NotFoundException si el usuario a actualizar no existe', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.update('invalid', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería realizar un soft delete poniendo isActive en false', async () => {
      const activeUser = { ...mockUser, isActive: true };
      usersRepo.findOne.mockResolvedValue(activeUser);
      usersRepo.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.remove('uuid-user');
      
      expect(activeUser.isActive).toBe(false);
      expect(usersRepo.save).toHaveBeenCalledWith(activeUser);
      expect(result).toEqual({ message: 'Usuario desactivado correctamente' });
    });

    it('debería lanzar NotFoundException si el usuario a eliminar no existe', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
