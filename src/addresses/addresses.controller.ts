import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Req } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  @Get()
  findAll(@Req() req) {
    const userId = req.user?.id || 'usuario-prueba-123';
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user?.id || 'usuario-prueba-123';
    return this.service.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateAddressDto, @Req() req) {
    const userId = req.user?.id || 'usuario-prueba-123';
    return this.service.create(userId, dto); 
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto, @Req() req) {
    const userId = req.user?.id || 'usuario-prueba-123';
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user?.id || 'usuario-prueba-123';
    return this.service.remove(id, userId);
  }
}