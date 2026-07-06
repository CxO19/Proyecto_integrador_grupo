import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductReviewDetailDocument = ProductReviewDetail & Document;

@Schema({ timestamps: true, collection: 'product_review_details' })
export class ProductReviewDetail {
  @Prop({ required: true, index: true })
  reviewId: string; // UUID de la reseña en PostgreSQL (enlace híbrido)

  @Prop({ required: true, index: true })
  productId: string; // UUID del producto en PostgreSQL

  @Prop({ type: Object, default: {} })
  ratingSummary: {
    buildQuality?: number;
    performance?: number;
    valueForMoney?: number;
  };

  @Prop({ type: [String], default: [] })
  pros: string[];

  @Prop({ type: [String], default: [] })
  cons: string[];

  @Prop({ default: false })
  verifiedPurchase: boolean;

  @Prop({ type: [String], default: [] })
  attachments: string[]; // URLs de imágenes adjuntas por el cliente
}

export const ProductReviewDetailSchema = SchemaFactory.createForClass(ProductReviewDetail);
