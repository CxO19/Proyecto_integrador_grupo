export class ValidateProductItemDto {
  productId: string;
  category: string;
  specs: Record<string, any>;
}

export class ValidateCartDto {
  products: ValidateProductItemDto[];
}