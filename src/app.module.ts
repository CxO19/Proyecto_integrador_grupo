import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsInventoryModule } from './reviews-inventory/reviews-inventory.module';
import { ComponentSpecsModule } from './component-specs/component-specs.module';
import { CompatibilityModule } from './compatibility/compatibility.module';

import { ReviewsModule } from './reviews/reviews.module';
@Module({
  imports: [
    ComponentSpecsModule,
    ReviewsInventoryModule,
    CompatibilityModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST'),
        port:     config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRoot('mongodb://localhost:27017/pc_store_catalog', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
  ],
})
export class AppModule {}


export class AppModule {}
