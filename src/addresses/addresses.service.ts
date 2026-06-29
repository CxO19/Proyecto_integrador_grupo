import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
 
  private addresses: any[] = [];
  private idCounter = 1;

  async create(userId: string, dto: CreateAddressDto) {
    const newAddress = {
      id: this.idCounter++,
      userId,
      ...dto,
      isDefault: dto.isDefault || false,
    };
    this.addresses.push(newAddress);
    return newAddress;
  }

  async findAll(userId: string) {
    return this.addresses.filter(addr => addr.userId === userId);
  }

  async findOne(id: number, userId: string) {
    const address = this.addresses.find(addr => addr.id === id && addr.userId === userId);
    if (!address) throw new NotFoundException('Dirección no encontrada');
    return address;
  }

  async update(id: number, dto: UpdateAddressDto, userId: string) {
    const address = await this.findOne(id, userId);
    Object.assign(address, dto);
    return address;
  }

  async remove(id: number, userId: string) {
    const address = await this.findOne(id, userId);
    this.addresses = this.addresses.filter(addr => addr.id !== id);
    return { deleted: true, address };
  }
}