import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { signUp: jest.Mock; signIn: jest.Mock };

  beforeEach(async () => {
    authService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    const dto: SignUpDto = {
      email: 'nuevo@example.com',
      password: 'password123',
      firstName: 'Nuevo',
      lastName: 'Usuario',
    };

    it('debería invocar authService.signUp con el DTO recibido', async () => {
      authService.signUp.mockResolvedValue({ access_token: 'token123' });

      const result = await controller.signUp(dto);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ access_token: 'token123' });
    });

    it('debería propagar el error si el servicio lanza BadRequestException (email duplicado)', async () => {
      authService.signUp.mockRejectedValue(new BadRequestException('El email ya está registrado'));

      await expect(controller.signUp(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signIn', () => {
    const dto: SignInDto = { email: 'juan@example.com', password: 'password123' };

    it('debería invocar authService.signIn con el DTO recibido y retornar el token', async () => {
      authService.signIn.mockResolvedValue({ access_token: 'token456' });

      const result = await controller.signIn(dto);

      expect(authService.signIn).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ access_token: 'token456' });
    });

    it('debería propagar el error si las credenciales son inválidas', async () => {
      authService.signIn.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.signIn(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
