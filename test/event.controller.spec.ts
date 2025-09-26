/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from 'src/modules/event/event.controller';
import { EventService } from 'src/modules/event/services/event.service';
import { mockEventService, mockEvent } from 'src/mocks/event.service.mock';

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an event', async () => {
    const result = await controller.create(mockEvent);
    expect(result).toEqual(mockEvent);
    expect(mockEventService.create).toHaveBeenCalledWith(mockEvent);
  });

  it('should return all events', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockEvent]);
  });
});
