import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Obtiene o crea el carrito del usuario
  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { userId } });
    if (!cart) {
      cart = new Cart();
      cart.userId = userId;
      cart = await this.cartRepo.save(cart);
    }
    return this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.product'] }) as Promise<Cart>;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const total = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    return { ...cart, total: Number(total.toFixed(2)) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const quantity = dto.quantity ?? 1;
    if (product.stock < quantity) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    const cart = await this.getOrCreateCart(userId);

    // Si el producto ya está en el carrito, suma la cantidad
    const existingItem = cart.items.find((i) => i.productId === dto.productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepo.save(existingItem);
    } else {
      const item = new CartItem();
      item.cartId = cart.id;
      item.productId = dto.productId;
      item.quantity = quantity;
      item.unitPrice = product.price;
      await this.cartItemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    item.quantity = dto.quantity;
    await this.cartItemRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    await this.cartItemRepo.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepo.remove(cart.items);
    return { message: 'Carrito vaciado correctamente' };
  }
}