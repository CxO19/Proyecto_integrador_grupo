import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { NotFoundException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuppliersService],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should logic-delete a supplier (remove)', async () => {
    const supplier = await service.create({ name: 'Tech', country: 'US' } as any);
    const result = await service.remove(supplier.id);
    expect(result.supplier.isActive).toBe(false);
  });

  it('should throw NotFoundException on addProduct if supplier missing', async () => {
    await expect(
      service.addProduct(99, { productId: 1, purchasePrice: 100, leadTimeDays: 5 } as any)
    ).rejects.toThrow(NotFoundException);
  });

  // --- AQUÍ ESTÁN LOS TESTS NUEVOS (ADENTRO DEL DESCRIBE PRINCIPAL) ---
  describe('findAll, update and products logic', () => {
    it('should find all with search and pagination', async () => {
      await service.create({ name: 'Intel', country: 'USA' } as any);
      await service.create({ name: 'AMD', country: 'USA' } as any);
      
      const result = await service.findAll({ search: 'intel', page: '1', limit: '10' });
      expect(result.data.length).toBe(1);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should update a supplier', async () => {
      const supplier = await service.create({ name: 'Corsair', country: 'USA' } as any);
      const updated = await service.update(supplier.id, { name: 'Corsair Updated' } as any);
      expect(updated.name).toBe('Corsair Updated');
    });

    it('should add, find and remove products from supplier', async () => {
      const supplier = await service.create({ name: 'Asus', country: 'Taiwan' } as any);
      
      // Add product
      const relation = await service.addProduct(supplier.id, { productId: 100, purchasePrice: 50, leadTimeDays: 2 } as any);
      expect(relation.productId).toBe(100);

      // Find products
      const products = await service.findProductsBySupplier(supplier.id);
      expect(products.length).toBe(1);

      // Remove product
      const removeRes = await service.removeProduct(supplier.id, 100);
      expect(removeRes.message).toContain('desasociado');
    });
  });
}); 