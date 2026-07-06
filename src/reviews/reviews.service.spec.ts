import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ProductReviewDetail } from './schemas/product-review-detail.schema';
import { CreateReviewDetailDto } from './dto/create-review-detail.dto';

// El Mock Avanzado para soportar 'new Model()' y '.save()'
const mockSave = jest.fn();

class MockMongooseModel {
  constructor(data: any) {}
  save = mockSave;

  static find = jest.fn();
  static findOne = jest.fn();
}

describe('ReviewsService', () => {
  let service: ReviewsService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getModelToken(ProductReviewDetail.name),
          useValue: MockMongooseModel,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateReviewDetailDto = {
      reviewId: 'rev-1',
      productId: 'prod-1',
      pros: ['Bueno'],
      cons: ['Caro'],
      useCase: 'Gaming',
      verifiedPurchase: true,
      helpfulVotes: 0,
    };

    it('debería crear el detalle de reseña exitosamente', async () => {
      mockSave.mockResolvedValue(mockReview);
      const result = await service.create(dto);
      expect(result.reviewId).toEqual(dto.reviewId);
    });

    it('debería lanzar un error si faltan datos en el modelo real (simulado)', async () => {
      mockSave.mockRejectedValueOnce(new Error('Mongoose Error'));
      await expect(service.create(dto)).rejects.toThrow('Mongoose Error');
    });
  });

  describe('findByProductId', () => {
    it('debería retornar un array de detalles de reseñas para un producto', async () => {
      MockMongooseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockReview]),
      });

      const result = await service.findByProductId('prod-1');

      expect(MockMongooseModel.find).toHaveBeenCalledWith({ productId: 'prod-1' });
      expect(result).toEqual([mockReview]);
    });

    it('debería retornar un array vacío si el producto no tiene reseñas', async () => {
      MockMongooseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findByProductId('invalido');
      expect(result).toEqual([]);
    });
  });

  describe('findByReviewId', () => {
    it('debería retornar el detalle de una reseña existente', async () => {
      MockMongooseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReview),
      });

      const result = await service.findByReviewId('rev-1');

      expect(MockMongooseModel.findOne).toHaveBeenCalledWith({ reviewId: 'rev-1' });
      expect(result).toEqual(mockReview);
    });

    it('debería lanzar NotFoundException si no encuentra el reviewId', async () => {
      MockMongooseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByReviewId('invalido')).rejects.toThrow(NotFoundException);
    });
  });
});