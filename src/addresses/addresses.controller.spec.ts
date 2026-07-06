import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: AddressesService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((userId, dto) => ({ id: 1, userId, ...dto })),
  };

  const mockRequest = {
    user: { id: 'test-user-id' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: mockService }],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
    service = module.get<AddressesService>(AddressesService);
  });

  it('should pass userId from request to service on create', async () => {
    const dto = { street: 'Test', city: 'City' };
    const result = await controller.create(dto as any, mockRequest);
    expect(result.userId).toBe('test-user-id');
    expect(service.create).toHaveBeenCalledWith('test-user-id', dto);
  });
});