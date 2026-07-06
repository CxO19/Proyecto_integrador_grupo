import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: { createFromCart: jest.Mock; findAll: jest.Mock; findOne: jest.Mock; cancel: jest.Mock };

  beforeEach(async () => {
    ordersService = {
      createFromCart: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('create', () => {
    it('debería llamar a ordersService.createFromCart con el userId del request', async () => {
      const mockReq = { user: { id: 'user-123' } };
      ordersService.createFromCart.mockResolvedValue({ id: 'order-123' });

      const result = await controller.create(mockReq);

      expect(ordersService.createFromCart).toHaveBeenCalledWith('user-123');
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('debería llamar a ordersService.findAll pasando el id y el rol mapeados por el Guard', async () => {
      const mockReq = { user: { id: 'user-123', role: 'admin' } };
      ordersService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq);

      expect(ordersService.findAll).toHaveBeenCalledWith('user-123', 'admin');
    });
  });
});