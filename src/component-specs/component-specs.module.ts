import { Module } from '@nestjs/common';
import { ComponentSpecsService } from './component-specs.service';
import { ComponentSpecsController } from './component-specs.controller';

@Module({
  controllers: [ComponentSpecsController],
  providers: [ComponentSpecsService],
})
export class ComponentSpecsModule {}