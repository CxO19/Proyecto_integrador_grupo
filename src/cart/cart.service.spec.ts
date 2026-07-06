import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: Repository<Cart>;
  let cartItemRepo: Repository<CartItem>;
  let productRepo: Repository<Product>;

  const mockCartRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCartItemRepo = {
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepo = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    const userId = 'user-123';
    const dto = { productId: 'prod-999', quantity: 2 };

    it('debería agregar un producto nuevo al carrito de forma exitosa', async () => {
      const mockProduct = { id: 'prod-999', stock: 10, price: 50 };
      const mockCart = { id: 'cart-1', userId, items: [] };

      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (cartRepo.findOne as jest.Mock).mockResolvedValue(mockCart);
      (cartItemRepo.save as jest.Mock).mockResolvedValue({});

      const result = await service.addItem(userId, dto);

      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: dto.productId } });
      expect(result).toBeDefined();
      expect(result.total).toBe(0);
    });

    it('debería acumular la cantidad si el producto ya existe en el carrito', async () => {
      const mockProduct = { id: 'prod-999', stock: 10, price: 50 };
      const existingItem = { id: 'item-1', productId: 'prod-999', quantity: 3, unitPrice: 50 };
      const mockCart = { id: 'cart-1', userId, items: [existingItem] };

      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (cartRepo.findOne as jest.Mock).mockResolvedValue(mockCart);
      (cartItemRepo.save as jest.Mock).mockResolvedValue({});

      const result = await service.addItem(userId, dto);

      expect(existingItem.quantity).toBe(5);
      expect(cartItemRepo.save).toHaveBeenCalledWith(existingItem);
      expect(result.total).toBe(250);
    });

    it('debería lanzar un NotFoundException si el producto no existe', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.addItem(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un BadRequestException si la cantidad supera el stock del producto', async () => {
      const mockProduct = { id: 'prod-999', stock: 1, price: 50 };
      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(service.addItem(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem & removeItem', () => {
    it('debería lanzar NotFoundException en updateItem si el item no pertenece al carrito', async () => {
      const mockCart = { id: 'cart-1', items: [] };
      (cartRepo.findOne as jest.Mock).mockResolvedValue(mockCart);

      await expect(service.updateItem('user-123', 'non-existent-item', { quantity: 5 })).rejects.toThrow(NotFoundException);
    });
  });
});