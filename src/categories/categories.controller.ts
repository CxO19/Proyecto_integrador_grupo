import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user.entity';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // GET /api/v1/categories?search=gpu&page=1&limit=10&sort=name&order=asc
  @Get()
  @ApiOperation({ summary: 'Obtener lista de categorías con filtros y paginación' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.categoriesService.findAll(search, +page, +limit, sort, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una categoría' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una categoría' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}