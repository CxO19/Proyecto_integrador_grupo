import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = new Product();
    product.name = dto.name;
    product.price = dto.price;
    if (dto.description) product.description = dto.description;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.imageUrl) product.imageUrl = dto.imageUrl;
    if (dto.categoryId) product.categoryId = dto.categoryId;
    if (dto.brandId) product.brandId = dto.brandId;

    return this.productsRepo.save(product);
  }

  async findAll(
    search?: string,
    categoryId?: string,
    brandId?: string,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order: 'asc' | 'desc' = 'asc',
  ) {
    const where: any = { isActive: true };

    if (search) where.name = ILike(`%${search}%`);
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const [data, total] = await this.productsRepo.findAndCount({
      where,
      order: { [sort]: order.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category', 'brand'],
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    product.isActive = false;
    await this.productsRepo.save(product);
    return { message: 'Producto desactivado correctamente' };
  }
}