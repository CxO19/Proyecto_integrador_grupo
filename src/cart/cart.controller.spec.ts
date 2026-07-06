import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let cartService: { getCart: jest.Mock; addItem: jest.Mock; clearCart: jest.Mock };

  beforeEach(async () => {
    cartService = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      clearCart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: CartService, useValue: cartService },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  describe('getCart', () => {
    it('debería llamar a cartService.getCart con el ID de usuario mapeado por el JwtAuthGuard', async () => {
      const mockReq = { user: { id: 'user-id-jwt-124' } };
      cartService.getCart.mockResolvedValue({ id: 'cart-1', items: [], total: 0 });

      const result = await controller.getCart(mockReq);

      expect(cartService.getCart).toHaveBeenCalledWith('user-id-jwt-124');
      expect(result).toHaveProperty('total', 0);
    });
  });

  describe('addItem', () => {
    it('debería transferir el userId del request y el payload DTO al servicio de manera íntegra', async () => {
      const mockReq = { user: { id: 'user-id-jwt-124' } };
      const dto: AddCartItemDto = { productId: 'prod-abc', quantity: 3 };
      cartService.addItem.mockResolvedValue({ id: 'cart-1', total: 150 });

      const result = await controller.addItem(mockReq, dto);

      expect(cartService.addItem).toHaveBeenCalledWith('user-id-jwt-124', dto);
      expect(result).toBeDefined();
    });
  });
});