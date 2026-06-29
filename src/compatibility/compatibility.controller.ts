import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CompatibilityService } from './compatibility.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ValidateCartDto } from './dto/validate-cart.dto';

@Controller('compatibility')
export class CompatibilityController {
  constructor(private readonly service: CompatibilityService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }


  @Post('validate')
  validateCart(@Body() dto: ValidateCartDto) {
    return this.service.validateCompatibility(dto);
  }
}