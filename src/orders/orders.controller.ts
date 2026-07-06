import { Controller, Get, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /api/v1/orders  → crea orden desde el carrito activo
  @Post()
  @ApiOperation({ summary: 'Crear una orden a partir del carrito activo' })
  create(@Req() req: any) {
    return this.ordersService.createFromCart(req.user.id);
  }

  // GET /api/v1/orders  → mis órdenes [client] / todas [admin]
  @Get()
  @ApiOperation({ summary: 'Obtener órdenes (todas para ADMIN, personales para CLIENT)' })
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user.id, req.user.role);
  }

  // GET /api/v1/orders/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una orden por ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }

  // PATCH /api/v1/orders/:id/cancel
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una orden' })
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.id, req.user.role);
  }
}