import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería castear query params a numbers y ejecutar findAll', async () => {
      mockCategoriesService.findAll.mockResolvedValue({ data: [], total: 0 });
      await controller.findAll('gpu', '3' as any, '25' as any, 'name', 'desc');
      
      expect(service.findAll).toHaveBeenCalledWith('gpu', 3, 25, 'name', 'desc');
    });

    it('debería retornar el error disparado por el servicio', async () => {
      mockCategoriesService.findAll.mockRejectedValue(new Error('Fallo general'));
      await expect(controller.findAll()).rejects.toThrow('Fallo general');
    });
  });

  describe('findOne', () => {
    it('debería retornar la categoría llamando al servicio', async () => {
      mockCategoriesService.findOne.mockResolvedValue({ id: '1' });
      expect(await controller.findOne('1')).toEqual({ id: '1' });
    });

    it('debería propagar error de NotFound', async () => {
      mockCategoriesService.findOne.mockRejectedValue(new Error('Not Found'));
      await expect(controller.findOne('99')).rejects.toThrow('Not Found');
    });
  });

  describe('create', () => {
    it('debería procesar la petición de creación', async () => {
      const dto = { name: 'Almacenamiento' };
      mockCategoriesService.create.mockResolvedValue({ id: '1', ...dto });
      expect(await controller.create(dto)).toEqual({ id: '1', ...dto });
    });

    it('debería propagar ConflictException desde el servicio', async () => {
      mockCategoriesService.create.mockRejectedValue(new Error('Conflict'));
      await expect(controller.create({ name: 'Existe' })).rejects.toThrow('Conflict');
    });
  });

  describe('update', () => {
    it('debería procesar la petición de actualización', async () => {
      mockCategoriesService.update.mockResolvedValue({ id: '1', name: 'Update' });
      expect(await controller.update('1', { name: 'Update' })).toEqual({ id: '1', name: 'Update' });
    });

    it('debería retornar error si falla la actualización', async () => {
      mockCategoriesService.update.mockRejectedValue(new Error('Error'));
      await expect(controller.update('1', { name: 'Error' })).rejects.toThrow('Error');
    });
  });

  describe('remove', () => {
    it('debería procesar la petición de soft delete', async () => {
      mockCategoriesService.remove.mockResolvedValue({ message: 'OK' });
      expect(await controller.remove('1')).toEqual({ message: 'OK' });
    });

    it('debería retornar error si el eliminado falla', async () => {
      mockCategoriesService.remove.mockRejectedValue(new Error('Delete Error'));
      await expect(controller.remove('1')).rejects.toThrow('Delete Error');
    });
  });
});