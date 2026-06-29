import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Product } from '../products/product.entity';
import { UserRole } from '../auth/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async createFromCart(userId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Obtener el carrito del usuario con sus items
      const cart = await manager.findOne(Cart, {
        where: { userId },
        relations: ['items', 'items.product'],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // 2. Verificar stock y descontarlo con bloqueo pesimista
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        // Bloqueo pesimista: ninguna otra transacción puede leer/modificar esta fila
        const product = await manager.findOne(Product, {
          where: { id: cartItem.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) throw new NotFoundException(`Producto ${cartItem.productId} no encontrado`);
        if (!product.isActive) throw new BadRequestException(`Producto ${product.name} no disponible`);
        if (product.stock < cartItem.quantity) {
          throw new ConflictException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, solicitado: ${cartItem.quantity}`,
          );
        }

        // Descontar stock
        product.stock -= cartItem.quantity;
        await manager.save(Product, product);

        // Crear item de orden
        const orderItem = new OrderItem();
        orderItem.productId = cartItem.productId;
        orderItem.quantity = cartItem.quantity;
        orderItem.unitPrice = cartItem.unitPrice;
        orderItems.push(orderItem);

        total += Number(cartItem.unitPrice) * cartItem.quantity;
      }

      // 3. Crear la orden
      const order = new Order();
      order.userId = userId;
      order.status = OrderStatus.CONFIRMED;
      order.total = Number(total.toFixed(2));
      order.items = orderItems;
      const savedOrder = await manager.save(Order, order);

      // 4. Vaciar el carrito
      await manager.remove(CartItem, cart.items);

      return savedOrder;
    });
  }

  async findAll(userId: string, role: string) {
    if (role === UserRole.ADMIN) {
      return this.ordersRepo.find({
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.ordersRepo.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, role: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) throw new NotFoundException(`Orden ${id} no encontrada`);

    // Un cliente solo puede ver sus propias órdenes
    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }

    return order;
  }

  async cancel(id: string, userId: string, role: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['items'],
      });

      if (!order) throw new NotFoundException(`Orden ${id} no encontrada`);
      if (role !== UserRole.ADMIN && order.userId !== userId) {
        throw new NotFoundException(`Orden ${id} no encontrada`);
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('La orden ya está cancelada');
      }

      // Devolver el stock
      for (const item of order.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (product) {
          product.stock += item.quantity;
          await manager.save(Product, product);
        }
      }

      order.status = OrderStatus.CANCELLED;
      return manager.save(Order, order);
    });
  }
}