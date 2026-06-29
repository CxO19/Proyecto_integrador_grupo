import { Module } from '@nestjs/common';
import { ReviewsInventoryService } from './reviews-inventory.service';
import { ReviewsInventoryController } from './reviews-inventory.controller';

@Module({
  controllers: [ReviewsInventoryController],
  providers: [ReviewsInventoryService],
})
export class ReviewsInventoryModule {}