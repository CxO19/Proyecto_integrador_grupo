import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

describe('BrandsController', () => {
  let controller: BrandsController;
  let brandsService: { 
    create: jest.Mock; 
    findAll: jest.Mock; 
    findOne: jest.Mock; 
    update: jest.Mock; 
    remove: jest.Mock 
  };

  const mockBrand = {
    id: 'uuid-brand',
    name: 'Asus',
    country: 'Taiwan',
    isActive: true,
  };

  beforeEach(async () => {
    brandsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        { provide: BrandsService, useValue: brandsService },
      ],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a BrandsService.create y retornar la marca creada', async () => {
      const dto: CreateBrandDto = { name: 'Asus' };
      brandsService.create.mockResolvedValue(mockBrand);

      const result = await controller.create(dto);

      expect(brandsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBrand);
    });
  });

  describe('findAll', () => {
    it('debería llamar a BrandsService.findAll y retornar los datos paginados', async () => {
      const expectedResponse = { data: [mockBrand], total: 1, page: 1, limit: 10 };
      brandsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll('amd', 1, 10, 'name', 'asc');

      expect(brandsService.findAll).toHaveBeenCalledWith('amd', 1, 10, 'name', 'asc');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('debería llamar a BrandsService.findOne y retornar la marca', async () => {
      brandsService.findOne.mockResolvedValue(mockBrand);

      const result = await controller.findOne('uuid-brand');

      expect(brandsService.findOne).toHaveBeenCalledWith('uuid-brand');
      expect(result).toEqual(mockBrand);
    });
  });

  describe('update', () => {
    it('debería llamar a BrandsService.update y retornar la marca actualizada', async () => {
      const dto: UpdateBrandDto = { country: 'USA' };
      brandsService.update.mockResolvedValue({ ...mockBrand, ...dto });

      const result = await controller.update('uuid-brand', dto);

      expect(brandsService.update).toHaveBeenCalledWith('uuid-brand', dto);
      expect(result.country).toEqual('USA');
    });
  });

  describe('remove', () => {
    it('debería llamar a BrandsService.remove y retornar mensaje', async () => {
      const expectedResponse = { message: 'Marca desactivada correctamente' };
      brandsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove('uuid-brand');

      expect(brandsService.remove).toHaveBeenCalledWith('uuid-brand');
      expect(result).toEqual(expectedResponse);
    });
  });
});
