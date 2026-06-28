import { IsUUID, IsOptional } from 'class-validator';

export class CreateOrderDto {

  @IsOptional()
  @IsUUID()
  addressId?: string;
}