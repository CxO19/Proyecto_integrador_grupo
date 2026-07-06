import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería convertir parámetros de string a número y llamar al servicio', async () => {
      mockProductsService.findAll.mockResolvedValue({ data: [], total: 0 });
      // Simulamos la entrada de Express donde vienen como strings
      await controller.findAll('rtx', 'cat1', 'brand1', '2' as any, '15' as any, 'price', 'desc');
      
      expect(service.findAll).toHaveBeenCalledWith('rtx', 'cat1', 'brand1', 2, 15, 'price', 'desc');
    });

    it('debería fallar y propagar error si el servicio falla', async () => {
      mockProductsService.findAll.mockRejectedValue(new Error('Internal Server Error'));
      await expect(controller.findAll()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('findOne', () => {
    it('debería llamar a findOne con el ID correcto', async () => {
      mockProductsService.findOne.mockResolvedValue({ id: 'uuid-1' });
      const result = await controller.findOne('uuid-1');
      expect(result).toEqual({ id: 'uuid-1' });
    });

    it('debería propagar errores del servicio en findOne', async () => {
      mockProductsService.findOne.mockRejectedValue(new Error('Not Found'));
      await expect(controller.findOne('99')).rejects.toThrow('Not Found');
    });
  });

  describe('create', () => {
    it('debería llamar a create del servicio', async () => {
      const dto = { name: 'Monitor', price: 200 } as any;
      mockProductsService.create.mockResolvedValue({ id: '1', ...dto });
      expect(await controller.create(dto)).toEqual({ id: '1', ...dto });
    });

    it('debería propagar error al crear', async () => {
      mockProductsService.create.mockRejectedValue(new Error('Bad Request'));
      await expect(controller.create({} as any)).rejects.toThrow('Bad Request');
    });
  });

  describe('update', () => {
    it('debería llamar a update del servicio con ID y DTO', async () => {
      const dto = { price: 250 } as any;
      mockProductsService.update.mockResolvedValue({ id: '1', price: 250 });
      expect(await controller.update('1', dto)).toEqual({ id: '1', price: 250 });
    });

    it('debería propagar error al actualizar', async () => {
      mockProductsService.update.mockRejectedValue(new Error('Update failed'));
      await expect(controller.update('1', {} as any)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('debería llamar a remove del servicio', async () => {
      mockProductsService.remove.mockResolvedValue({ message: 'OK' });
      expect(await controller.remove('1')).toEqual({ message: 'OK' });
    });

    it('debería propagar error al eliminar', async () => {
      mockProductsService.remove.mockRejectedValue(new Error('Delete failed'));
      await expect(controller.remove('1')).rejects.toThrow('Delete failed');
    });
  });
});