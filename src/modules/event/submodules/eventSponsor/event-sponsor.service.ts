/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddEventSponsorDto } from './dto/add-event-sponsor.dto';
import { UpdateEventSponsorDto } from './dto/update-event-sponsor.dto';
import { EventSponsorPaginationQueryDto } from './dto/event-sponsor-pagination.dto';
import { EventSponsor, Prisma } from '@prisma/client';

@Injectable()
export class EventSponsorService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== EVENT-SPONSOR RELATIONSHIP CRUD ====================

  async addSponsorToEvent(dto: AddEventSponsorDto): Promise<EventSponsor> {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: dto.event_id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if sponsor exists
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id: dto.sponsor_id },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    // Check if relationship already exists
    const existingRelationship = await this.prisma.eventSponsor.findFirst({
      where: {
        event_id: dto.event_id,
        sponsor_id: dto.sponsor_id,
      },
    });

    if (existingRelationship) {
      throw new ConflictException(
        'Sponsor is already associated with this event',
      );
    }

    try {
      return await this.prisma.eventSponsor.create({
        data: {
          event_id: dto.event_id,
          sponsor_id: dto.sponsor_id,
          tier: dto.tier,
          order: dto.order,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
            },
          },
          sponsor: {
            select: {
              id: true,
              name: true,
              logo_url: true,
              tier: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to add sponsor to event');
    }
  }

  async findAllEventSponsors(query: EventSponsorPaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      order = 'DESC',
      event_id,
      sponsor_id,
      tier,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventSponsorWhereInput = {};

    if (event_id) {
      where.event_id = event_id;
    }

    if (sponsor_id) {
      where.sponsor_id = sponsor_id;
    }

    if (tier) {
      where.tier = { contains: tier, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { sponsor: { name: { contains: search, mode: 'insensitive' } } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
        { tier: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [eventSponsors, total] = await Promise.all([
      this.prisma.eventSponsor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order.toLowerCase() },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
              status: true,
            },
          },
          sponsor: {
            select: {
              id: true,
              name: true,
              logo_url: true,
              tier: true,
              featured: true,
            },
          },
        },
      }),
      this.prisma.eventSponsor.count({ where }),
    ]);

    return {
      items: eventSponsors,
      total,
      page,
      pageSize: limit,
    };
  }

  async findSponsorsForEvent(eventId: string) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.eventSponsor.findMany({
      where: { event_id: eventId },
      include: {
        sponsor: true,
      },
      orderBy: [
        { order: { sort: 'asc', nulls: 'last' } },
        { created_at: 'asc' },
      ],
    });
  }

  async findEventsForSponsor(sponsorId: string) {
    // Check if sponsor exists
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id: sponsorId },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    return this.prisma.eventSponsor.findMany({
      where: { sponsor_id: sponsorId },
      include: {
        event: true,
      },
      orderBy: { event: { event_date: 'desc' } },
    });
  }

  async findOneEventSponsor(
    eventId: string,
    sponsorId: string,
  ): Promise<EventSponsor> {
    const eventSponsor = await this.prisma.eventSponsor.findFirst({
      where: {
        event_id: eventId,
        sponsor_id: sponsorId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            event_date: true,
            status: true,
          },
        },
        sponsor: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            tier: true,
          },
        },
      },
    });

    if (!eventSponsor) {
      throw new NotFoundException('Event-sponsor relationship not found');
    }

    return eventSponsor;
  }

  async updateEventSponsor(
    eventId: string,
    sponsorId: string,
    dto: UpdateEventSponsorDto,
  ): Promise<EventSponsor> {
    const existingRelationship = await this.prisma.eventSponsor.findFirst({
      where: {
        event_id: eventId,
        sponsor_id: sponsorId,
      },
    });

    if (!existingRelationship) {
      throw new NotFoundException('Event-sponsor relationship not found');
    }

    try {
      return await this.prisma.eventSponsor.update({
        where: { id: existingRelationship.id },
        data: {
          ...(dto.tier !== undefined && { tier: dto.tier }),
          ...(dto.order !== undefined && { order: dto.order }),
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
            },
          },
          sponsor: {
            select: {
              id: true,
              name: true,
              logo_url: true,
              tier: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update event-sponsor relationship',
      );
    }
  }

  async removeSponsorFromEvent(
    eventId: string,
    sponsorId: string,
  ): Promise<{ message: string }> {
    const existingRelationship = await this.prisma.eventSponsor.findFirst({
      where: {
        event_id: eventId,
        sponsor_id: sponsorId,
      },
    });

    if (!existingRelationship) {
      throw new NotFoundException('Event-sponsor relationship not found');
    }

    try {
      await this.prisma.eventSponsor.delete({
        where: { id: existingRelationship.id },
      });
      return { message: 'Sponsor removed from event successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to remove sponsor from event');
    }
  }

  async getMostActiveSponsors(limit = 10) {
    const sponsors = await this.prisma.sponsor.findMany({
      select: {
        id: true,
        name: true,
        logo_url: true,
        tier: true,
        featured: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        events: { _count: 'desc' },
      },
      take: limit,
    });

    return sponsors.map((sponsor) => ({
      ...sponsor,
      eventCount: sponsor._count.events,
    }));
  }

  async getTopEventsBySponsors(limit = 10) {
    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        title: true,
        event_date: true,
        status: true,
        _count: {
          select: { sponsors: true },
        },
      },
      orderBy: {
        sponsors: { _count: 'desc' },
      },
      take: limit,
    });

    return events.map((event) => ({
      ...event,
      sponsorCount: event._count.sponsors,
    }));
  }
}
