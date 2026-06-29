import { IsUUID, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}