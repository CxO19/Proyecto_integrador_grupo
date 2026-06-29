import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SignUpDto, SignInDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const exists = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('El email ya está registrado');

    const hashed: string = await bcrypt.hash(dto.password, 10);

    const user = new User();
    user.email = dto.email;
    user.password = hashed;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;

    const saved = await this.usersRepository.save(user);
    const token = this.jwtService.sign({ sub: saved.id, email: saved.email, role: saved.role });
    return { access_token: token };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { access_token: token };
  }
}