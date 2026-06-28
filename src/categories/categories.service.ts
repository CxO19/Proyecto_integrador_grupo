import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoriesRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('La categoría ya existe');

    const category = new Category();
    category.name = dto.name;
    if (dto.description) category.description = dto.description;

    return this.categoriesRepo.save(category);
  }

  async findAll(search?: string, page = 1, limit = 10, sort = 'name', order: 'asc' | 'desc' = 'asc') {
    const where = search ? { name: ILike(`%${search}%`) } : {};

    const [data, total] = await this.categoriesRepo.findAndCount({
      where,
      order: { [sort]: order.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoriesRepo.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    category.isActive = false;
    await this.categoriesRepo.save(category);
    return { message: 'Categoría desactivada correctamente' };
  }
}