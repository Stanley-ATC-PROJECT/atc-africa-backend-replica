/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SponsorPaginationQueryDto } from './dto/sponsor-pagination-query.dto';

@Injectable()
export class SponsorService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────── Basic CRUD ────────────────
  async create(data: Prisma.SponsorCreateInput) {
    try {
      return await this.prisma.sponsor.create({ data });
    } catch (error) {
      throw new BadRequestException('Failed to create sponsor');
    }
  }

  async findAll(query: SponsorPaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      order = 'DESC',
      search,
      tier,
      featured,
      name,
      website_url,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SponsorWhereInput = {};

    // Apply filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tier: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier) {
      where.tier = { contains: tier, mode: 'insensitive' };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (website_url) {
      where.website_url = { contains: website_url, mode: 'insensitive' };
    }

    const [sponsors, total] = await Promise.all([
      this.prisma.sponsor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order.toLowerCase() },
      }),
      this.prisma.sponsor.count({ where }),
    ]);

    return {
      items: sponsors,
      total,
      page,
      pageSize: limit,
    };
  }

  async findOne(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    return sponsor;
  }

  async update(id: string, data: Prisma.SponsorUpdateInput) {
    const existingSponsor = await this.prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    try {
      return await this.prisma.sponsor.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update sponsor');
    }
  }

  async remove(id: string) {
    const existingSponsor = await this.prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    try {
      await this.prisma.sponsor.delete({
        where: { id },
      });
      return { message: 'Sponsor deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete sponsor');
    }
  }

  // ──────────────── Stats ────────────────
  async getStats() {
    const [total, featuredCount, tierStats] = await Promise.all([
      this.prisma.sponsor.count(),
      this.prisma.sponsor.count({ where: { featured: true } }),
      this.prisma.sponsor.groupBy({
        by: ['tier'],
        _count: { tier: true },
        orderBy: { _count: { tier: 'desc' } },
      }),
    ]);

    return {
      total,
      featuredCount,
      tierStats: tierStats.map((stat) => ({
        tier: stat.tier || 'Unknown',
        count: stat._count.tier,
      })),
    };
  }
}
