import { Test, TestingModule } from '@nestjs/testing';
import { CompatibilityService } from './compatibility.service';
import { BadRequestException } from '@nestjs/common';

describe('CompatibilityService', () => {
  let service: CompatibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompatibilityService],
    }).compile();

    service = module.get<CompatibilityService>(CompatibilityService);
  });

  it('should validate correctly when components match', async () => {
    const cart = {
      products: [
        { category: 'cpu', specs: { socket: 'AM5' } },
        { category: 'motherboard', specs: { socket: 'AM5' } }
      ]
    };
    
    const result = await service.validateCompatibility(cart as any);
    expect(result.compatible).toBe(true);
  });

  it('should throw BadRequestException when components do not match', async () => {
    const cart = {
      products: [
        { category: 'cpu', specs: { socket: 'AM4' } },
        { category: 'motherboard', specs: { socket: 'AM5' } }
      ]
    };

    await expect(service.validateCompatibility(cart as any)).rejects.toThrow(BadRequestException);
  });

  describe('CRUD operations for compatibility rules', () => {
    it('should create a rule', async () => {
      const rule = await service.create({ ruleName: 'TEST_RULE' } as any);
      expect(rule.ruleName).toBe('TEST_RULE');
      expect(rule._id).toBeDefined();
    });

    it('should find all rules', async () => {
      const rules = await service.findAll();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should find one rule', async () => {
      const rule = await service.findOne('rule-socket-1');
      expect(rule.ruleName).toBe('CPU_MOTHERBOARD_SOCKET');
    });

    it('should update a rule', async () => {
      const updated = await service.update('rule-socket-1', { errorMessage: 'Nuevo error' } as any);
      expect(updated.errorMessage).toBe('Nuevo error');
    });

    it('should remove a rule', async () => {
      const created = await service.create({ ruleName: 'TO_DELETE' } as any);
      const result = await service.remove(created._id);
      expect(result.message).toContain('eliminada');
    });
  });
});