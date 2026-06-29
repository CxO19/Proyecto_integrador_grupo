import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './brand.dto';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
