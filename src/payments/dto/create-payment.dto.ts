<<<<<<< Updated upstream
import { IsEnum, IsNumber, IsInt, IsOptional, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../payments/entities/payment.entity';

export class CreatePaymentDto {
  @IsInt()
  orderId!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsNumber()
  amount!: number;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
=======
export class CreatePaymentDto {}
>>>>>>> Stashed changes
