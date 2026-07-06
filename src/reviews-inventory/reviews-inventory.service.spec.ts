import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsInventoryService } from './reviews-inventory.service';
import { BadRequestException } from '@nestjs/common';

describe('ReviewsInventoryService', () => {
  let service: ReviewsInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsInventoryService],
    }).compile();

    service = module.get<ReviewsInventoryService>(ReviewsInventoryService);
  });

  it('should throw BadRequestException if rating is invalid', async () => {
    await expect(
      service.createReview('client-123', 10, { rating: 6, comment: 'Great' })
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if user has not purchased product', async () => {
    await expect(
      service.createReview('client-123', 99, { rating: 5, comment: 'Great' })
    ).rejects.toThrow(BadRequestException);
  });

  it('should create review successfully for confirmed order', async () => {
    const review = await service.createReview('client-123', 10, { rating: 5, comment: 'Good' });
    expect(review).toBeDefined();
    expect(review.productId).toBe(10);
  });

  describe('Other review methods and stock movements', () => {
    it('should find all reviews and reviews by product', async () => {
      const all = await service.findAllReviews();
      expect(Array.isArray(all)).toBe(true);

      const byProduct = await service.findReviewsByProduct(10);
      expect(Array.isArray(byProduct)).toBe(true);
    });

    it('should remove a review', async () => {
      (service as any).reviews.push({ id: 99, userId: 'test', productId: 1 });
      const result = await service.removeReview(99);
      expect(result.message).toContain('eliminada');
    });

    it('should handle stock movements', async () => {
      const movement = await service.registerStockMovement(5, { type: 'IN', quantity: 10, reason: 'Restock' } as any);
      expect(movement.productId).toBe(5);

      const overview = await service.getInventoryOverview();
      expect(overview.length).toBeGreaterThan(0);

      const history = await service.getProductHistory(5);
      expect(history.length).toBe(1);
      expect(history[0].type).toBe('IN');
    });
  });
});