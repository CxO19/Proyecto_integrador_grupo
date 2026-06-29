import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto {
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  paidAt?: Date;
}