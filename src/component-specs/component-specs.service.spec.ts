import { Test, TestingModule } from '@nestjs/testing';
import { ComponentSpecsService } from './component-specs.service';

describe('ComponentSpecsService', () => {
  let service: ComponentSpecsService;

  beforeEach(async () => {
    // Si el servicio no existe aún en tu proyecto, tendrás que crearlo o ignorar este test
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentSpecsService],
    }).compile();

    service = module.get<ComponentSpecsService>(ComponentSpecsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});