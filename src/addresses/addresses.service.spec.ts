import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { NotFoundException } from '@nestjs/common';

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesService],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should create an address', async () => {
    const dto = { street: 'Av Siempre Viva', city: 'Springfield', isDefault: true };
    const result = await service.create('user-1', dto as any);
    expect(result.id).toBe(1);
    expect(result.userId).toBe('user-1');
  });

  it('should throw NotFoundException if address not found', async () => {
    await expect(service.findOne(99, 'user-1')).rejects.toThrow(NotFoundException);
  });

  describe('Find, Update and Remove', () => {
    it('should find all addresses for a user', async () => {
      await service.create('user-2', { street: 'A', city: 'B' } as any);
      const addresses = await service.findAll('user-2');
      expect(addresses.length).toBe(1);
    });

    it('should update an address', async () => {
      const address = await service.create('user-3', { street: 'Old', city: 'City' } as any);
      const updated = await service.update(address.id, { street: 'New' } as any, 'user-3');
      expect(updated.street).toBe('New');
    });

    it('should remove an address', async () => {
      const address = await service.create('user-4', { street: 'Del', city: 'City' } as any);
      const result = await service.remove(address.id, 'user-4');
      expect(result.deleted).toBe(true);
    });
  });
});