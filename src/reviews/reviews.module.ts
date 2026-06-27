import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ProductReviewDetail, ProductReviewDetailSchema } from './schemas/product-review-detail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductReviewDetail.name, schema: ProductReviewDetailSchema }])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
