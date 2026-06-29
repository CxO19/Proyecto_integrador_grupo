import { Controller, Get, Post, Delete, Patch, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ReviewsInventoryService } from './reviews-inventory.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller()
export class ReviewsInventoryController {
  constructor(private readonly service: ReviewsInventoryService) {}

  @Get('reviews')
  getAllReviews() {
    return this.service.findAllReviews();
  }

  @Get('products/:id/reviews')
  getProductReviews(@Param('id', ParseIntPipe) productId: number) {
    return this.service.findReviewsByProduct(productId);
  }

  @Post('products/:id/reviews')
  createReview(
    @Param('id', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'client-123';
    return this.service.createReview(userId, productId, dto);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeReview(id);
  }

  @Get('inventory')
  getInventory() {
    return this.service.getInventoryOverview();
  }

  @Get('inventory/:productId/history')
  getProductHistory(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getProductHistory(productId);
  }

  @Patch('inventory/:productId')
  updateInventory(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateStockDto
  ) {
    return this.service.registerStockMovement(productId, dto);
  }
}