/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Event, EventStatus, EventCategory } from '@prisma/client';
@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────── Basic CRUD ────────────────
  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({ data });
  }

  async findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        event_highlight: true,
        social_media_mentions: true,
      },
    });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<Event[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.event.findMany({ skip, take, where, orderBy });
  }

  async count(where?: Prisma.EventWhereInput) {
    return this.prisma.event.count({ where });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return this.prisma.event.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id } });
  }

  // ──────────────── Filters & Queries ────────────────
  async searchEvents(searchTerm: string): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { about: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { event_date: 'desc' },
    });
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { organizer_id: organizerId },
      orderBy: { event_date: 'desc' },
    });
  }

  async findWithDetails(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        speakers: { include: { speaker: true }, orderBy: { order: 'asc' } },
        sponsors: { include: { sponsor: true }, orderBy: { order: 'asc' } },
      },
    });
  }

  async findWithSpeakers(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        speakers: { include: { speaker: true }, orderBy: { order: 'asc' } },
      },
    });
  }

  async findWithSponsors(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        sponsors: { include: { sponsor: true }, orderBy: { order: 'asc' } },
      },
    });
  }

  // ──────────────── Speaker / Sponsor ────────────────
  async addSpeakerToEvent(
    eventId: string,
    speakerId: string,
    isKeynote = false,
    order?: number,
  ) {
    return this.prisma.eventSpeaker.create({
      data: {
        event_id: eventId,
        speaker_id: speakerId,
        is_keynote: isKeynote,
        order,
      },
    });
  }

  async removeSpeakerFromEvent(eventId: string, speakerId: string) {
    return this.prisma.eventSpeaker.deleteMany({
      where: { event_id: eventId, speaker_id: speakerId },
    });
  }

  // Note: Sponsor management has been moved to EventSponsorService
  // These methods are no longer needed in EventRepository

  // ──────────────── Admin Actions ────────────────
  async approveEvent(id: string, approverId: string): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.approved,
        // The following fields exist in DB but TS types may lag until prisma generate runs
        // Cast to any to avoid type errors before codegen is updated
        approved_by: approverId,
        approval_date: new Date(),
      } as any,
    });
  }

  async rejectEvent(id: string): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.rejected },
    });
  }

  async featureEvent(id: string, is_featured: boolean): Promise<Event> {
    return this.prisma.event.update({ where: { id }, data: { is_featured } });
  }

  // ──────────────── Statistics ────────────────
  async getEventCount(): Promise<number> {
    return this.prisma.event.count();
  }

  async getEventsInDateRange(start: Date, end: Date) {
    // Deprecated: range now handled in service via unified findAll
    return this.prisma.event.findMany({
      where: {
        event_date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { event_date: 'asc' },
    });
  }
}
