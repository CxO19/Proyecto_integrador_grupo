import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDetailDto } from './dto/create-review-detail.dto';

@ApiTags('Reviews (MongoDB)')
@Controller('review-details')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear los detalles de una reseña en MongoDB' })
  @ApiResponse({ status: 201, description: 'Detalle de reseña creado exitosamente.' })
  create(@Body() createReviewDto: CreateReviewDetailDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener todos los detalles de reseñas de un producto' })
  @ApiParam({ name: 'productId', description: 'UUID del producto en PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Retorna la lista de detalles de reseñas.' })
  findByProductId(@Param('productId') productId: string) {
    return this.reviewsService.findByProductId(productId);
  }

  @Get(':reviewId')
  @ApiOperation({ summary: 'Obtener el detalle de una reseña por su reviewId' })
  @ApiParam({ name: 'reviewId', description: 'UUID de la reseña en PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Retorna el detalle de la reseña.' })
  findByReviewId(@Param('reviewId') reviewId: string) {
    return this.reviewsService.findByReviewId(reviewId);
  }
}
