import { Test, TestingModule } from '@nestjs/testing';
import { DiscogsController } from './discogs.controller';

describe('DiscogsController', () => {
  let controller: DiscogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscogsController],
    }).compile();

    controller = module.get<DiscogsController>(DiscogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
