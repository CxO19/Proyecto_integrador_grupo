export class CreateSpecDto {
  productId: string;
  category: string;
  specs: Record<string, any>;
}