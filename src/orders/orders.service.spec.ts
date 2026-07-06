import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Product } from '../products/product.entity';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { UserRole } from '../auth/user.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: any;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
  };

  const mockOrdersRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrdersRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepo = module.get(getRepositoryToken(Order));
    jest.clearAllMocks();
  });

  describe('createFromCart', () => {
    const userId = 'user-123';

    it('debería crear una orden exitosamente descontando stock y vaciando el carrito', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 50 }
        ]
      };
      const mockProduct = { id: 'prod-1', name: 'Gamer CPU', stock: 10, isActive: true };

      mockManager.findOne
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockProduct);
      
      mockManager.save.mockImplementation((entityClass, entity) => Promise.resolve(entity));
      mockManager.remove.mockResolvedValue({});

      const result = await service.createFromCart(userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.total).toBe(100);
      expect(mockProduct.stock).toBe(8);
    });

    it('debería lanzar BadRequestException si el carrito está vacío', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.createFromCart(userId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el producto no está activo', async () => {
      const mockCart = { id: 'cart-1', items: [{ productId: 'prod-1', quantity: 1 }] };
      const mockProduct = { id: 'prod-1', name: 'CPU', stock: 10, isActive: false };

      mockManager.findOne
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockProduct);

      await expect(service.createFromCart(userId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si no hay stock suficiente', async () => {
      const mockCart = { id: 'cart-1', items: [{ productId: 'prod-1', quantity: 5 }] };
      const mockProduct = { id: 'prod-1', name: 'CPU', stock: 2, isActive: true };

      mockManager.findOne
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockProduct);

      await expect(service.createFromCart(userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las órdenes si el rol es ADMIN', async () => {
      ordersRepo.find.mockResolvedValue([{ id: 'order-1' }, { id: 'order-2' }]);

      const result = await service.findAll('user-123', UserRole.ADMIN);

      expect(ordersRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' }
      }));
      expect(result.length).toBe(2);
    });

    it('debería filtrar por userId si el rol es CLIENT', async () => {
      ordersRepo.find.mockResolvedValue([{ id: 'order-1', userId: 'user-123' }]);

      await service.findAll('user-123', UserRole.CLIENT);

      expect(ordersRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-123' }
      }));
    });
  });
});