import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}