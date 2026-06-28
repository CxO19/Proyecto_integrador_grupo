import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Brand } from './brand.entity';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepo: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto): Promise<Brand> {
    const exists = await this.brandsRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('La marca ya existe');

    const brand = new Brand();
    brand.name = dto.name;
    if (dto.country) brand.country = dto.country;
    if (dto.logoUrl) brand.logoUrl = dto.logoUrl;

    return this.brandsRepo.save(brand);
  }

  async findAll(search?: string, page = 1, limit = 10, sort = 'name', order: 'asc' | 'desc' = 'asc') {
    const where = search ? { name: ILike(`%${search}%`) } : {};

    const [data, total] = await this.brandsRepo.findAndCount({
      where,
      order: { [sort]: order.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Marca ${id} no encontrada`);
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    Object.assign(brand, dto);
    return this.brandsRepo.save(brand);
  }

  async remove(id: string): Promise<{ message: string }> {
    const brand = await this.findOne(id);
    brand.isActive = false;
    await this.brandsRepo.save(brand);
    return { message: 'Marca desactivada correctamente' };
  }
}