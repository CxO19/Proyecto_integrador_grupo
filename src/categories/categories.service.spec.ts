import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoriesRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepo,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una categoría si el nombre no existe', async () => {
      const dto = { name: 'Periféricos' };
      mockCategoriesRepo.findOne.mockResolvedValue(null);
      mockCategoriesRepo.save.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', name: 'Periféricos' });
      expect(mockCategoriesRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el nombre ya existe', async () => {
      const dto = { name: 'Periféricos' };
      mockCategoriesRepo.findOne.mockResolvedValue({ id: '1', name: 'Periféricos' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería retornar paginación y listado de categorías', async () => {
      const mockData = [{ id: '1', name: 'Audio' }];
      mockCategoriesRepo.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll('Audio', 1, 10);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    it('debería fallar si ocurre un error en base de datos', async () => {
      mockCategoriesRepo.findAndCount.mockRejectedValue(new Error('DB connection lost'));
      await expect(service.findAll()).rejects.toThrow('DB connection lost');
    });
  });

  describe('findOne', () => {
    it('debería retornar la categoría encontrada', async () => {
      mockCategoriesRepo.findOne.mockResolvedValue({ id: '1', name: 'Redes' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Redes');
    });

    it('debería lanzar NotFoundException si no encuentra la categoría', async () => {
      mockCategoriesRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar la categoría correctamente', async () => {
      const mockCat = { id: '1', name: 'Viejito' };
      mockCategoriesRepo.findOne.mockResolvedValue(mockCat);
      mockCategoriesRepo.save.mockResolvedValue({ ...mockCat, name: 'Nuevo' });

      const result = await service.update('1', { name: 'Nuevo' });
      expect(result.name).toBe('Nuevo');
    });

    it('debería lanzar NotFoundException al actualizar ID inexistente', async () => {
      mockCategoriesRepo.findOne.mockResolvedValue(null);
      await expect(service.update('99', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería hacer soft delete cambiando isActive a false', async () => {
      const mockCat = { id: '1', isActive: true };
      mockCategoriesRepo.findOne.mockResolvedValue(mockCat);
      mockCategoriesRepo.save.mockResolvedValue({ ...mockCat, isActive: false });

      const result = await service.remove('1');
      expect(result.message).toBe('Categoría desactivada correctamente');
      expect(mockCategoriesRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });

    it('debería lanzar NotFoundException al intentar eliminar un ID falso', async () => {
      mockCategoriesRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});