import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /api/v1/cart
  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  // POST /api/v1/cart/items
  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  // PATCH /api/v1/cart/items/:id
  @Patch('items/:id')
  updateItem(@Req() req: any, @Param('id') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  // DELETE /api/v1/cart/items/:id
  @Delete('items/:id')
  removeItem(@Req() req: any, @Param('id') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  // DELETE /api/v1/cart
  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}