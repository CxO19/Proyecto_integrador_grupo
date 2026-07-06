import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from './brands.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

describe('BrandsService', () => {
  let service: BrandsService;
  let brandsRepo: { findOne: jest.Mock; findAndCount: jest.Mock; save: jest.Mock };

  const mockBrand: Brand = {
    id: 'uuid-brand',
    name: 'Asus',
    country: 'Taiwan',
    logoUrl: 'asus.png',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
  };

  beforeEach(async () => {
    brandsRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: getRepositoryToken(Brand), useValue: brandsRepo },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateBrandDto = {
      name: 'Asus',
      country: 'Taiwan',
    };

    it('debería crear una marca exitosamente', async () => {
      brandsRepo.findOne.mockResolvedValue(null);
      brandsRepo.save.mockImplementation((brand) => Promise.resolve({ ...mockBrand, ...brand }));

      const result = await service.create(dto);

      expect(brandsRepo.findOne).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(brandsRepo.save).toHaveBeenCalled();
      expect(result.name).toEqual('Asus');
      expect(result.country).toEqual('Taiwan');
    });

    it('debería lanzar ConflictException si la marca ya existe', async () => {
      brandsRepo.findOne.mockResolvedValue(mockBrand);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(brandsRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar datos y metadatos con paginación por defecto', async () => {
      brandsRepo.findAndCount.mockResolvedValue([[mockBrand], 1]);

      const result = await service.findAll();

      expect(brandsRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockBrand],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('debería aplicar los filtros de búsqueda correctamente', async () => {
      brandsRepo.findAndCount.mockResolvedValue([[], 0]);
      
      await service.findAll('AMD', 2, 5, 'country', 'desc');

      expect(brandsRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        skip: 5,
        take: 5,
        order: { country: 'DESC' },
      }));
    });
  });

  describe('findOne', () => {
    it('debería retornar una marca si existe', async () => {
      brandsRepo.findOne.mockResolvedValue(mockBrand);

      const result = await service.findOne('uuid-brand');
      expect(brandsRepo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-brand' } });
      expect(result).toEqual(mockBrand);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      brandsRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const dto: UpdateBrandDto = { country: 'USA' };

    it('debería actualizar una marca exitosamente', async () => {
      brandsRepo.findOne.mockResolvedValue({ ...mockBrand });
      brandsRepo.save.mockImplementation((brand) => Promise.resolve(brand));

      const result = await service.update('uuid-brand', dto);

      expect(brandsRepo.save).toHaveBeenCalled();
      expect(result.country).toEqual('USA');
    });

    it('debería lanzar NotFoundException si la marca a actualizar no existe', async () => {
      brandsRepo.findOne.mockResolvedValue(null);
      await expect(service.update('invalido', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería desactivar una marca lógicamente (soft delete)', async () => {
      const activeBrand = { ...mockBrand, isActive: true };
      brandsRepo.findOne.mockResolvedValue(activeBrand);
      brandsRepo.save.mockImplementation((brand) => Promise.resolve(brand));

      const result = await service.remove('uuid-brand');

      expect(activeBrand.isActive).toBe(false);
      expect(brandsRepo.save).toHaveBeenCalledWith(activeBrand);
      expect(result).toEqual({ message: 'Marca desactivada correctamente' });
    });

    it('debería lanzar NotFoundException si la marca a eliminar no existe', async () => {
      brandsRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('invalido')).rejects.toThrow(NotFoundException);
    });
  });
});
