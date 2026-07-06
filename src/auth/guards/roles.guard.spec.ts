import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (user?: { role: UserRole }): ExecutionContext =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('debería permitir el acceso si la ruta no requiere roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debería permitir el acceso si el arreglo de roles requeridos está vacío', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = buildContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debería permitir el acceso si el usuario tiene el rol requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({ role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debería lanzar ForbiddenException si el usuario no tiene el rol requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({ role: UserRole.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('debería lanzar ForbiddenException si no hay usuario en la request', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = buildContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
