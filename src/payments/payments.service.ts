import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

export enum PaymentMethod {
  CARD = 'card',
  TRANSFER = 'transfer',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Injectable()
export class PaymentsService {
  // Simulamos la tabla de la base de datos en memoria
  private payments: any[] = [];

  async create(dto: CreatePaymentDto) {
    const crypto = require('crypto');
    const newPayment = {
      id: crypto.randomUUID(), // Genera un UUID simulando tu base de datos
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      paidAt: null,
      ...dto,
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async findAll() {
    return this.payments;
  }

  async findOne(id: number) {
    // Nota: Como tu controlador maneja ids numéricos por el ParseIntPipe, 
    // lo buscamos convirtiendo a String o directo según cómo lo envíes
    const payment = this.payments.find(p => p.id === id || p.id === String(id));
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    if (dto.status === 'completed') {
      payment.paidAt = new Date();
    }
    return payment;
  }
}