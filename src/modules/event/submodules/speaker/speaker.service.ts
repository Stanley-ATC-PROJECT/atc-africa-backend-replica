/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SpeakerRepository } from './speaker.repository';
import { SpeakerPaginationQueryDto } from './dto/speaker-pagination-query.dto';

@Injectable()
export class SpeakerService {
  constructor(private readonly speakerRepository: SpeakerRepository) {}

  // ──────────────── Basic CRUD ────────────────
  async create(data: Prisma.SpeakerCreateInput) {
    return this.speakerRepository.create(data);
  }

  async findAll(filter: SpeakerPaginationQueryDto) {
    const where: Prisma.SpeakerWhereInput = {};
    let orderBy: Prisma.SpeakerOrderByWithRelationInput = {
      created_at: 'desc',
    };

    // Pagination defaults
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    // Apply filters
    if (filter.position) {
      where.position = { contains: filter.position, mode: 'insensitive' };
    }

    if (filter.keynote !== undefined) {
      where.events = {
        some: {
          is_keynote: filter.keynote,
        },
      };
    }

    if (filter.active !== undefined && filter.active) {
      // Active speakers are those who have spoken at events
      where.events = {
        some: {},
      };
    }

    // Text search (firstName, lastName, position, bio)
    if (filter.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { position: { contains: filter.search, mode: 'insensitive' } },
        { bio: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.speakerRepository.findMany({ where, orderBy, skip, take: limit }),
      this.speakerRepository.count(where),
    ]);

    return { items, total, page, pageSize: limit };
  }

  async findOne(id: string) {
    return this.speakerRepository.findById(id);
  }

  async findWithEvents(speakerId: string) {
    return this.speakerRepository.findWithEvents(speakerId);
  }

  async update(id: string, data: Prisma.SpeakerUpdateInput) {
    return this.speakerRepository.update(id, data);
  }

  async remove(id: string) {
    return this.speakerRepository.delete(id);
  }
}
