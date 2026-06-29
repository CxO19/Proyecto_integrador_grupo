import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ComponentSpecsService } from './component-specs.service';
import { CreateSpecDto } from './dto/create-spec.dto';
import { UpdateSpecDto } from './dto/update-spec.dto';

@Controller('specs')
export class ComponentSpecsController {
  constructor(private readonly service: ComponentSpecsService) {}


  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }


  @Post()
  create(@Body() dto: CreateSpecDto) {
    return this.service.create(dto);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpecDto) {
    return this.service.update(id, dto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}