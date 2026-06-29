import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}