/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Prisma, $Enums } from '@prisma/client';
import { EventPaginationQueryDto } from '../dto/event-pagination-query.dto';
import { EventRepository } from '../event.repository';
import { EventSponsorService } from '../submodules/eventSponsor/event-sponsor.service';
import { StorageService } from '../../../utils/storage/storage.service';
import { DocumentType } from '../../../utils/storage/constants';
import { EventNotificationService } from './event-notification.service';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSponsorService: EventSponsorService,
    private readonly storageService: StorageService,
    private readonly eventNotificationService: EventNotificationService,
  ) {}

  // ──────────────── Basic CRUD ────────────────
  async create(data: Prisma.EventCreateInput) {
    return this.eventRepository.create(data);
  }

  async findAll(filter: EventPaginationQueryDto) {
    const where: Prisma.EventWhereInput = {};
    let orderBy: Prisma.EventOrderByWithRelationInput = { event_date: 'desc' };
    // Pagination defaults
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    // Apply filters
    if (filter.organizer) where.organizer_id = filter.organizer;
    if (filter.status) where.status = filter.status as $Enums.EventStatus;
    if (filter.category)
      where.category = filter.category as $Enums.EventCategory;
    if (filter.featured !== undefined) where.is_featured = filter.featured;

    // Date range filter (inclusive)
    if (filter.start || filter.end) {
      where.event_date = {};
      if (filter.start)
        (where.event_date as Prisma.DateTimeFilter).gte = new Date(
          filter.start,
        );
      if (filter.end)
        (where.event_date as Prisma.DateTimeFilter).lte = new Date(filter.end);
      // If both present keep ascending order
      if (filter.start && filter.end) {
        orderBy = { event_date: 'asc' };
      }
    }

    // Text search (title, description, about)
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { about: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.eventRepository.findMany({ where, orderBy, skip, take: limit }),
      this.eventRepository.count(where),
    ]);

    return { items, total, page, pageSize: limit };
  }

  async findOne(id: string) {
    return this.eventRepository.findById(id);
  }

  async update(id: string, data: Prisma.EventUpdateInput) {
    return this.eventRepository.update(id, data);
  }

  async remove(id: string) {
    return this.eventRepository.delete(id);
  }

  // ──────────────── Filtering / Queries ────────────────
  async markAsFeatured(id: string, is_featured: boolean) {
    return this.eventRepository.featureEvent(id, is_featured);
  }

  // ──────────────── Speaker Management ────────────────
  async addSpeaker(
    event_id: string,
    speaker_id: string,
    is_keynote = false,
    order?: number,
  ) {
    return this.eventRepository.addSpeakerToEvent(
      event_id,
      speaker_id,
      is_keynote,
      order,
    );
  }

  async removeSpeaker(event_id: string, speaker_id: string) {
    return this.eventRepository.removeSpeakerFromEvent(event_id, speaker_id);
  }

  // Removed getEventInDateRange (handled in findAll)

  async searchEvents(searchTerm: string) {
    return this.eventRepository.searchEvents(searchTerm);
  }

  // ──────────────── Admin Review Actions ────────────────
  async approveEvent(id: string, approverId: string) {
    const approvedEvent = await this.eventRepository.approveEvent(
      id,
      approverId,
    );

    if (approvedEvent) {
      await this.eventNotificationService.startPostEventReminderProcess({
        id: approvedEvent.id,
        event_date: approvedEvent.event_date,
      });
    }

    return approvedEvent;
  }

  async rejectEvent(id: string) {
    return this.eventRepository.rejectEvent(id);
  }

  // ──────────────── Event-Speaker Association ────────────────
  async addSpeakerToEvent(event_id: string, speaker_id: string) {
    return this.eventRepository.addSpeakerToEvent(event_id, speaker_id);
  }

  async removeSpeakerFromEvent(event_id: string, speaker_id: string) {
    return this.eventRepository.removeSpeakerFromEvent(event_id, speaker_id);
  }

  async findSpeakersForEvent(eventId: string) {
    // Get event with speakers included
    const event = await this.eventRepository.findWithSpeakers(eventId);
    return event?.speakers || [];
  }

  // ──────────────── Sponsor Management ────────────────
  // Note: Sponsor management has been moved to EventSponsorService
  // These methods are kept for backward compatibility but delegate to the submodule
  async findSponsorsForEvent(eventId: string) {
    return this.eventSponsorService.findSponsorsForEvent(eventId);
  }

  async addSponsorToEvent(event_id: string, sponsor_id: string) {
    return this.eventSponsorService.addSponsorToEvent({
      event_id,
      sponsor_id,
    });
  }

  async removeSponsorFromEvent(event_id: string, sponsor_id: string) {
    return this.eventSponsorService.removeSponsorFromEvent(
      event_id,
      sponsor_id,
    );
  }

  // ──────────────── File Upload ────────────────
  async uploadFlyer(
    file: MulterFile,
    options: { folder?: string; fileName?: string } = {},
  ) {
    return this.storageService.uploadFileWithMetadata(file, {
      documentType: DocumentType.EVENT_FLYER,
      folder: options.folder || 'events',
      fileName: options.fileName,
    });
  }

  async uploadAndUpdateFlyer(
    eventId: string,
    file: MulterFile,
    options: { folder?: string; fileName?: string } = {},
  ) {
    // Upload the flyer
    const uploadResult = await this.uploadFlyer(file, options);

    // Update the event with the new flyer URL
    const updatedEvent = await this.update(eventId, {
      flyer_image: uploadResult.url,
    });

    return {
      ...uploadResult,
      event: updatedEvent,
    };
  }
}
