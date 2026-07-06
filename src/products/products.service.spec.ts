import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear y retornar un producto exitosamente', async () => {
      const dto = { name: 'RTX 4090', price: 1500, stock: 10 };
      const savedProduct = { id: 'uuid-1', ...dto };
      mockProductRepository.save.mockResolvedValue(savedProduct);

      const result = await service.create(dto as any);
      expect(result).toEqual(savedProduct);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('debería fallar si el repositorio lanza un error al guardar', async () => {
      mockProductRepository.save.mockRejectedValue(new Error('Error de Base de Datos'));
      await expect(service.create({ name: 'Error' } as any)).rejects.toThrow('Error de Base de Datos');
    });
  });

  describe('findAll', () => {
    it('debería retornar datos con filtros aplicados y paginación', async () => {
      const mockData = [{ id: '1', name: 'Monitor' }];
      mockProductRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll('Mon', 'cat-id', 'brand-id', 1, 10);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
      expect(mockProductRepository.findAndCount).toHaveBeenCalled();
    });

    it('debería propagar errores de la consulta', async () => {
      mockProductRepository.findAndCount.mockRejectedValue(new Error('Fallo general'));
      await expect(service.findAll()).rejects.toThrow('Fallo general');
    });
  });

  describe('findOne', () => {
    it('debería retornar un producto si es encontrado por ID', async () => {
      const mockProduct = { id: '1', name: 'Teclado' };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar y guardar un producto existente', async () => {
      const mockProduct = { id: '1', name: 'Antiguo' };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({ id: '1', name: 'Nuevo' });

      const result = await service.update('1', { name: 'Nuevo' } as any);
      expect(result.name).toBe('Nuevo');
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nuevo' }));
    });

    it('debería lanzar NotFoundException al actualizar un ID inexistente', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería cambiar isActive a false (soft delete) y retornar mensaje', async () => {
      const mockProduct = { id: '1', isActive: true };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await service.remove('1');
      expect(result).toEqual({ message: 'Producto desactivado correctamente' });
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });

    it('debería lanzar NotFoundException al eliminar un producto que no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});