import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SignUpDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(signUpDto: SignUpDto): Promise<User> {
    const existingUser = await this.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashed = await (bcrypt.hash as (data: string, rounds: number) => Promise<string>)(signUpDto.password, 10);
        
    const user = new User();
    user.email = signUpDto.email;
    user.password = hashed;
    user.firstName = signUpDto.firstName;
    user.lastName = signUpDto.lastName;

    return this.usersRepository.save(user);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}