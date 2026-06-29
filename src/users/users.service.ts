import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashed = await (bcrypt.hash as (data: string, rounds: number) => Promise<string>)(dto.password, 10);

    const user = new User();
    user.email = dto.email;
    user.password = hashed;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    if (dto.role) user.role = dto.role;

    return this.usersRepo.save(user);
  }

  async findAll(
    search?: string,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order: 'asc' | 'desc' = 'asc',
  ) {
    const where = search
      ? [{ firstName: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
      : {};

    const [data, total] = await this.usersRepo.findAndCount({
      where,
      order: { [sort]: order.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    user.isActive = false;
    await this.usersRepo.save(user);
    return { message: 'Usuario desactivado correctamente' };
  }
}