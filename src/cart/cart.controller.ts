import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Shopping Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /api/v1/cart
  @Get()
  @ApiOperation({ summary: 'Obtener el carrito activo del usuario' })
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  // POST /api/v1/cart/items
  @Post('items')
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  // PATCH /api/v1/cart/items/:id
  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar la cantidad de un producto en el carrito' })
  updateItem(@Req() req: any, @Param('id') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  // DELETE /api/v1/cart/items/:id
  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  removeItem(@Req() req: any, @Param('id') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  // DELETE /api/v1/cart
  @Delete()
  @ApiOperation({ summary: 'Vaciar el carrito completamente' })
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}