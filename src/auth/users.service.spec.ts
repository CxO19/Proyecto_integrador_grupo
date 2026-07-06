import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { SignUpDto } from './auth.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('UsersService (auth)', () => {
  let service: UsersService;
  let usersRepository: { findOne: jest.Mock; save: jest.Mock };

  const mockUser: User = {
    id: 'uuid-1',
    email: 'juan@example.com',
    password: 'hashed_password',
    firstName: 'Juan',
    lastName: 'Perez',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: usersRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('debería retornar el usuario si existe', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('juan@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: 'juan@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('inexistente@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('debería retornar el usuario por id', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si el id no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const dto: SignUpDto = {
      email: 'nuevo@example.com',
      password: 'password123',
      firstName: 'Nuevo',
      lastName: 'Usuario',
    };

    it('debería crear un usuario nuevo con la contraseña hasheada', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_x' as never);
      usersRepository.save.mockImplementation((user: User) => Promise.resolve(user));

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(result.password).toBe('hashed_x');
      expect(result.email).toBe(dto.email);
    });

    it('debería lanzar BadRequestException si el email ya existe', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('debería retornar true si la contraseña coincide con el hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      const result = await service.validatePassword('password123', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBe(true);
    });

    it('debería retornar false si la contraseña no coincide', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      const result = await service.validatePassword('incorrecta', 'hashed_password');

      expect(result).toBe(false);
    });
  });
});
