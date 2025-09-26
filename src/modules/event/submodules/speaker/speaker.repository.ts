import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Speaker } from '@prisma/client';

@Injectable()
export class SpeakerRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Basic CRUD operations
  async create(data: Prisma.SpeakerCreateInput): Promise<Speaker> {
    return this.prisma.speaker.create({
      data,
    });
  }

  async findById(id: string): Promise<Speaker | null> {
    return this.prisma.speaker.findUnique({
      where: { id },
    });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.SpeakerWhereInput;
    orderBy?: Prisma.SpeakerOrderByWithRelationInput;
  }): Promise<Speaker[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.speaker.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async count(where?: Prisma.SpeakerWhereInput) {
    return this.prisma.speaker.count({ where });
  }

  async update(id: string, data: Prisma.SpeakerUpdateInput): Promise<Speaker> {
    return this.prisma.speaker.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Speaker> {
    return this.prisma.speaker.delete({
      where: { id },
    });
  }

  async findWithEvents(id: string) {
    return this.prisma.speaker.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            event: {
              include: {
                organizer: true,
              },
            },
          },
          orderBy: { event: { event_date: 'desc' } },
        },
      },
    });
  }
}
