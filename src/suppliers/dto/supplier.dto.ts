export class CreateSupplierDto {
  name!: string;
  contactEmail!: string;
  phone!: string;
  country!: string;
}

export class UpdateSupplierDto {
  name?: string;
  contactEmail?: string;
  phone?: string;
  country?: string;
  isActive?: boolean;
}

export class AddProductSupplierDto {
  productId!: number;
  purchasePrice!: number;
  leadTimeDays!: number;
}