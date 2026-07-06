import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    removeProduct: jest.fn().mockResolvedValue({ message: 'Removed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [{ provide: SuppliersService, useValue: mockService }],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should call removeProduct on service', async () => {
    await controller.removeProduct(1, 10);
    expect(service.removeProduct).toHaveBeenCalledWith(1, 10);
  });
});