import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ValidateCartDto } from './dto/validate-cart.dto';

@Injectable()
export class CompatibilityService {
  private rules: any[] = [];

  constructor() {

    this.rules.push({
      _id: 'rule-socket-1',
      ruleName: 'CPU_MOTHERBOARD_SOCKET',
      categoryA: 'cpu',
      categoryB: 'motherboard',
      fieldA: 'socket',
      fieldB: 'socket',
      operator: 'must_match',
      errorMessage: 'El socket del CPU debe coincidir con el de la placa base',
    });
  }

  async create(dto: CreateRuleDto) {
    const crypto = require('crypto');
    const newRule = {
      _id: crypto.randomUUID(),
      ...dto,
    };
    this.rules.push(newRule);
    return newRule;
  }

  async findAll() {
    return this.rules;
  }

  async findOne(id: string) {
    const rule = this.rules.find(r => r._id === id);
    if (!rule) throw new NotFoundException('Regla de compatibilidad no encontrada.');
    return rule;
  }

  async update(id: string, dto: UpdateRuleDto) {
    const rule = await this.findOne(id);
    Object.assign(rule, dto);
    return rule;
  }

  async remove(id: string) {
    const index = this.rules.findIndex(r => r._id === id);
    if (index === -1) throw new NotFoundException('Regla no encontrada.');
    const deleted = this.rules.splice(index, 1);
    return { message: 'Regla eliminada de MongoDB', rule: deleted[0] };
  }


  async validateCompatibility(dto: ValidateCartDto) {
    const { products } = dto;

    for (const rule of this.rules) {

      const componentA = products.find(p => p.category.toLowerCase() === rule.categoryA.toLowerCase());
      const componentB = products.find(p => p.category.toLowerCase() === rule.categoryB.toLowerCase());

      // Si ambos componentes están presentes, evaluamos la compatibilidad
      if (componentA && componentB) {
        const valA = componentA.specs?.[rule.fieldA];
        const valB = componentB.specs?.[rule.fieldB];

        if (rule.operator === 'must_match') {
          if (!valA || !valB || valA !== valB) {
            // TAREA: Retornar 400 con el errorMessage de la regla que falló
            throw new BadRequestException({
              status: 400,
              error: 'Incompatibilidad de hardware',
              message: rule.errorMessage,
            });
          }
        }
      }
    }

    return { compatible: true, message: 'Todos los componentes son compatibles entre sí.' };
  }
}