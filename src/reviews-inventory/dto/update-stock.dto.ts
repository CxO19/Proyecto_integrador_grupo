export class UpdateStockDto {
  type!: 'in' | 'out';
  quantity!: number;
  reason!: string;
}