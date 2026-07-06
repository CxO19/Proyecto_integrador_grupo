import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, AddProductSupplierDto } from './dto/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}


  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }


  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.service.create(dto);
  }


  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.service.update(id, dto);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }


  @Get(':id/products')
  findProducts(@Param('id', ParseIntPipe) id: number) {
    return this.service.findProductsBySupplier(id);
  }


  @Post(':id/products')
  addProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: AddProductSupplierDto) {
    return this.service.addProduct(id, dto);
  }

  @Delete(':id/products/:productId')
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.service.removeProduct(id, productId);
  }
}