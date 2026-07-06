import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from './user.entity';
import { SignUpDto, SignInDto } from './auth.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: { findOne: jest.Mock; save: jest.Mock };
  let jwtService: { sign: jest.Mock };

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
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const dto: SignUpDto = {
      email: 'nuevo@example.com',
      password: 'password123',
      firstName: 'Nuevo',
      lastName: 'Usuario',
    };

    it('debería registrar un usuario nuevo y retornar un access_token', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password' as never);
      usersRepository.save.mockResolvedValue({ ...mockUser, ...dto, password: 'hashed_password' });
      jwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.signUp(dto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersRepository.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('debería lanzar BadRequestException si el email ya está registrado', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.signUp(dto)).rejects.toThrow(BadRequestException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('debería hashear la contraseña antes de guardar', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const hashSpy = (bcrypt.hash as jest.Mock).mockResolvedValue('hash_x' as never);
      usersRepository.save.mockImplementation((user: User) => Promise.resolve(user));
      jwtService.sign.mockReturnValue('token');

      await service.signUp(dto);

      expect(hashSpy).toHaveBeenCalledWith(dto.password, 10);
      const savedArg = usersRepository.save.mock.calls[0][0];
      expect(savedArg.password).toBe('hash_x');
    });
  });

  describe('signIn', () => {
    const dto: SignInDto = { email: 'juan@example.com', password: 'password123' };

    it('debería iniciar sesión con credenciales correctas y retornar un access_token', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.signIn(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
