import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RatingSummaryDto {
  @ApiPropertyOptional({ example: 4, description: 'Calificación de la calidad de construcción (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  buildQuality?: number;

  @ApiPropertyOptional({ example: 5, description: 'Calificación del rendimiento (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  performance?: number;

  @ApiPropertyOptional({ example: 4, description: 'Calificación de la relación calidad-precio (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueForMoney?: number;
}

export class CreateReviewDetailDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID de la reseña base en PostgreSQL' })
  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'UUID del producto en PostgreSQL' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ type: RatingSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RatingSummaryDto)
  ratingSummary?: RatingSummaryDto;

  @ApiPropertyOptional({ example: ['Buen rendimiento', 'Silenciosa'], description: 'Puntos positivos' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pros?: string[];

  @ApiPropertyOptional({ example: ['Es muy grande', 'Gasta mucha energía'], description: 'Puntos negativos' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cons?: string[];

  @ApiPropertyOptional({ example: true, description: 'Indica si el usuario realmente compró el producto' })
  @IsBoolean()
  @IsOptional()
  verifiedPurchase?: boolean;

  @ApiPropertyOptional({ example: ['http://img1.jpg'], description: 'URLs de imágenes adjuntas' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
