import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpecDto } from './dto/create-spec.dto';
import { UpdateSpecDto } from './dto/update-spec.dto';

@Injectable()
export class ComponentSpecsService {
  private componentSpecs: any[] = [];
  private idCounter = 1;

  async create(dto: CreateSpecDto) {
    const crypto = require('crypto');
    const newSpec = {
      _id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.componentSpecs.push(newSpec);
    return newSpec;
  }


  async findAll(query: { productId?: string; category?: string; page?: string; limit?: string }) {
    let result = [...this.componentSpecs];


    if (query.productId) {
      result = result.filter(s => s.productId === query.productId);
    }


    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      data: result.slice(startIndex, endIndex),
      total: result.length,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const spec = this.componentSpecs.find(s => s._id === id);
    if (!spec) throw new NotFoundException('Especificación técnica no encontrada en MongoDB.');
    return spec;
  }

  async update(id: string, dto: UpdateSpecDto) {
    const spec = await this.findOne(id);
    

    if (dto.specs) {
      spec.specs = { ...spec.specs, ...dto.specs };
    }
    
    if (dto.productId) spec.productId = dto.productId;
    if (dto.category) spec.category = dto.category;
    
    spec.updatedAt = new Date();
    return spec;
  }

  async remove(id: string) {
    const index = this.componentSpecs.findIndex(s => s._id === id);
    if (index === -1) throw new NotFoundException('Especificación técnica no encontrada.');
    const deleted = this.componentSpecs.splice(index, 1);
    return { message: 'Especificación eliminada de MongoDB', deleted: deleted[0] };
  }
}