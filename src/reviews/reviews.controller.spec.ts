import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewDetailDto } from './dto/create-review-detail.dto';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: { 
    create: jest.Mock; 
    findByProductId: jest.Mock; 
    findByReviewId: jest.Mock; 
  };

  const mockReview = {
    reviewId: 'rev-1',
    productId: 'prod-1',
    pros: ['Bueno'],
    cons: ['Caro'],
    useCase: 'Gaming',
    verifiedPurchase: true,
    helpfulVotes: 0,
  };

  beforeEach(async () => {
    reviewsService = {
      create: jest.fn(),
      findByProductId: jest.fn(),
      findByReviewId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: reviewsService },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a ReviewsService.create y retornar el detalle de reseña', async () => {
      const dto: CreateReviewDetailDto = {
        reviewId: 'rev-1',
        productId: 'prod-1',
        pros: ['Bueno'],
        cons: ['Caro'],
        useCase: 'Gaming',
        verifiedPurchase: true,
        helpfulVotes: 0,
      };
      reviewsService.create.mockResolvedValue(mockReview);

      const result = await controller.create(dto);

      expect(reviewsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockReview);
    });
  });

  describe('findByProductId', () => {
    it('debería llamar a ReviewsService.findByProductId y retornar el array', async () => {
      reviewsService.findByProductId.mockResolvedValue([mockReview]);

      const result = await controller.findByProductId('prod-1');

      expect(reviewsService.findByProductId).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual([mockReview]);
    });
  });

  describe('findByReviewId', () => {
    it('debería llamar a ReviewsService.findByReviewId y retornar el objeto', async () => {
      reviewsService.findByReviewId.mockResolvedValue(mockReview);

      const result = await controller.findByReviewId('rev-1');

      expect(reviewsService.findByReviewId).toHaveBeenCalledWith('rev-1');
      expect(result).toEqual(mockReview);
    });
  });
});
