import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductReviewDetail, ProductReviewDetailDocument } from './schemas/product-review-detail.schema';
import { CreateReviewDetailDto } from './dto/create-review-detail.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(ProductReviewDetail.name) private reviewModel: Model<ProductReviewDetailDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDetailDto): Promise<ProductReviewDetail> {
    const createdReview = new this.reviewModel(createReviewDto);
    return createdReview.save();
  }

  async findByProductId(productId: string): Promise<ProductReviewDetail[]> {
    return this.reviewModel.find({ productId }).exec();
  }

  async findByReviewId(reviewId: string): Promise<ProductReviewDetail> {
    const review = await this.reviewModel.findOne({ reviewId }).exec();
    if (!review) {
      throw new NotFoundException(`Detalle de reseña con reviewId ${reviewId} no encontrado`);
    }
    return review;
  }
}
