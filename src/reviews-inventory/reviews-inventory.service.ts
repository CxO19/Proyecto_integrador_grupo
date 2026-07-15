import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ReviewsInventoryService {
  private reviews: any[] = [];
  private stockMovements: any[] = [];

  private reviewIdCounter = 1;
  private stockIdCounter = 1;

  private mockConfirmedOrders = [
    { userId: 'client-123', productId: 10 },
    { userId: 'client-123', productId: 11 },
  ];


  async createReview(userId: string, productId: number, dto: CreateReviewDto) {
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
    throw new BadRequestException('El rating debe estar entre 1 y 5.');
    }


    const hasPurchased = this.mockConfirmedOrders.some(
      order => order.userId === userId && order.productId === productId
    );
    if (!hasPurchased) {
      throw new BadRequestException('Solo puedes reseñar productos que hayas comprado (Orden confirmada).');
    }


    const alreadyReviewed = this.reviews.some(
      r => r.userId === userId && r.productId === productId
    );
    if (alreadyReviewed) {
      throw new BadRequestException('Ya has dejado una reseña para este producto.');
    }

    const newReview = {
      id: this.reviewIdCounter++,
      userId,
      ...dto,
      productId,
      createdAt: new Date(),
    };

    this.reviews.push(newReview);
    return newReview;
  }

  async findAllReviews() {
    return this.reviews;
  }

  async findReviewsByProduct(productId: number) {
    return this.reviews.filter(r => r.productId === productId);
  }

  async removeReview(id: number) {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) throw new NotFoundException('Reseña no encontrada.');
    const deleted = this.reviews.splice(index, 1);
    return { message: 'Reseña eliminada por el administrador', review: deleted[0] };
  }


  async registerStockMovement(productId: number, dto: UpdateStockDto) {
    const newMovement = {
      id: this.stockIdCounter++,
      productId,
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason,
      createdAt: new Date(),
    };

    this.stockMovements.push(newMovement);
    return newMovement;
  }

  async getInventoryOverview() {
    return this.stockMovements;
  }

  async getProductHistory(productId: number) {
    return this.stockMovements.filter(m => m.productId === productId);
  }
}