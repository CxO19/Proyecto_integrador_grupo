import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto, AddProductSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {

  private suppliers: any[] = [];
  private productSuppliers: any[] = [];
  
  private supplierIdCounter = 1;
  private relIdCounter = 1;


  async create(dto: CreateSupplierDto) {
    const newSupplier = {
      id: this.supplierIdCounter++,
      ...dto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }


  async findAll(query: { search?: string; page?: string; limit?: string }) {
    let result = [...this.suppliers];

    // Búsqueda por nombre o país
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchLower) || 
        s.country.toLowerCase().includes(searchLower)
      );
    }

    // Paginación simple
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      data: result.slice(startIndex, endIndex),
      total: result.length,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const supplier = this.suppliers.find(s => s.id === id);
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, { ...dto, updatedAt: new Date() });
    return supplier;
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    supplier.isActive = false; // Borrado lógico estándar
    supplier.updatedAt = new Date();
    return { message: `Proveedor ${id} desactivado correctamente`, supplier };
  }


  async addProduct(supplierId: number, dto: AddProductSupplierDto) {
    await this.findOne(supplierId);

    const newRelation = {
      id: this.relIdCounter++,
      supplierId,
      productId: Number(dto.productId),
      purchasePrice: dto.purchasePrice,
      leadTimeDays: dto.leadTimeDays,
    };

    this.productSuppliers.push(newRelation);
    return newRelation;
  }

  async findProductsBySupplier(supplierId: number) {
    await this.findOne(supplierId);
    return this.productSuppliers.filter(ps => ps.supplierId === supplierId);
  }

  async removeProduct(supplierId: number, productId: number) {
    await this.findOne(supplierId);
    const initialLength = this.productSuppliers.length;
    
    this.productSuppliers = this.productSuppliers.filter(
      ps => !(ps.supplierId === supplierId && ps.productId === productId)
    );

    if (this.productSuppliers.length === initialLength) {
      throw new NotFoundException('El producto no estaba asociado a este proveedor');
    }

    return { message: `Producto ${productId} desasociado del proveedor ${supplierId}` };
  }
}